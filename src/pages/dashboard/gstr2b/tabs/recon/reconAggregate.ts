import type { Gstr2bMatchStatus, Gstr2bReconciliationRow } from '../../types/gstr2b-filing.types';
import { BUCKET_ORDER } from './reconMeta';

export type HeadId = 'taxable' | 'igst' | 'cgst' | 'sgst' | 'cess' | 'total';

interface HeadSpec {
  id: HeadId;
  label: string;
  gstr2b: keyof Gstr2bReconciliationRow;
  ims: keyof Gstr2bReconciliationRow;
}

/** The six lines every reconciliation statement is stated on. */
export const HEADS: HeadSpec[] = [
  { id: 'taxable', label: 'Taxable value', gstr2b: 'gstr2bTaxableValue', ims: 'imsTaxableValue' },
  { id: 'igst', label: 'IGST', gstr2b: 'gstr2bIgst', ims: 'imsIgst' },
  { id: 'cgst', label: 'CGST', gstr2b: 'gstr2bCgst', ims: 'imsCgst' },
  { id: 'sgst', label: 'SGST', gstr2b: 'gstr2bSgst', ims: 'imsSgst' },
  { id: 'cess', label: 'Cess', gstr2b: 'gstr2bCess', ims: 'imsCess' },
  { id: 'total', label: 'Total tax', gstr2b: 'gstr2bTotalTax', ims: 'imsTotalTax' },
];

export type HeadTotals = Record<HeadId, number>;

function zeroHeads(): HeadTotals {
  return { taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, total: 0 };
}

function num(row: Gstr2bReconciliationRow, field: keyof Gstr2bReconciliationRow): number {
  const v = row[field];
  return typeof v === 'number' && !Number.isNaN(v) ? v : 0;
}

export interface BucketRollup {
  count: number;
  atRisk: number;
  unclaimed: number;
  /** IMS − GSTR-2B per head, summed across the bucket. */
  diff: HeadTotals;
}

export interface ReconSummary {
  rowCount: number;
  /** Invoices in any bucket other than MATCHED. */
  attentionCount: number;
  matchedCount: number;
  decidedCount: number;
  editedCount: number;
  atRisk: number;
  unclaimed: number;
  byBucket: Record<Gstr2bMatchStatus, BucketRollup>;
  /** Control totals the buckets have to add back up to. */
  gstr2b: HeadTotals;
  ims: HeadTotals;
  gstr2bCount: number;
  imsCount: number;
  /**
   * True when every invoice landed in exactly one known bucket, so the explained
   * difference adds back to the control total on every head.
   */
  tiesOut: boolean;
}

function emptyBuckets(): Record<Gstr2bMatchStatus, BucketRollup> {
  const out = {} as Record<Gstr2bMatchStatus, BucketRollup>;
  for (const key of BUCKET_ORDER) {
    out[key] = { count: 0, atRisk: 0, unclaimed: 0, diff: zeroHeads() };
  }
  return out;
}

/**
 * Rolls the rows up for the headline band and the reconciliation statement.
 *
 * The per-head difference is derived here from the raw GSTR-2B and IMS figures rather
 * than read off the row's server-supplied `delta*` fields, so the statement's control
 * total and its bucket breakdown always come from the same numbers and the tie-out
 * check tests what it claims to: that no invoice fell outside the buckets.
 */
export function summarise(rows: Gstr2bReconciliationRow[]): ReconSummary {
  const byBucket = emptyBuckets();
  const gstr2b = zeroHeads();
  const ims = zeroHeads();
  let atRisk = 0;
  let unclaimed = 0;
  let matchedCount = 0;
  let decidedCount = 0;
  let editedCount = 0;
  let gstr2bCount = 0;
  let imsCount = 0;
  let bucketed = 0;

  for (const row of rows) {
    for (const head of HEADS) {
      gstr2b[head.id] += num(row, head.gstr2b);
      ims[head.id] += num(row, head.ims);
    }
    if (row.gstr2bInvoiceId != null) gstr2bCount += 1;
    if (row.imsInvoiceId != null) imsCount += 1;
    atRisk += num(row, 'atRisk');
    unclaimed += num(row, 'unclaimed');
    if (row.matchStatus === 'MATCHED') matchedCount += 1;
    if (row.reconciliationAction && row.reconciliationAction !== 'PENDING') decidedCount += 1;
    if (row.edited) editedCount += 1;

    const bucket = byBucket[row.matchStatus];
    if (!bucket) continue;
    bucketed += 1;
    bucket.count += 1;
    bucket.atRisk += num(row, 'atRisk');
    bucket.unclaimed += num(row, 'unclaimed');
    for (const head of HEADS) {
      bucket.diff[head.id] += num(row, head.ims) - num(row, head.gstr2b);
    }
  }

  return {
    rowCount: rows.length,
    attentionCount: rows.length - matchedCount,
    matchedCount,
    decidedCount,
    editedCount,
    atRisk,
    unclaimed,
    byBucket,
    gstr2b,
    ims,
    gstr2bCount,
    imsCount,
    tiesOut: bucketed === rows.length,
  };
}

export interface VendorRow {
  id: string;
  supplierGstin: string | null;
  supplierName: string | null;
  invoices: number;
  exceptions: number;
  decided: number;
  atRisk: number;
  unclaimed: number;
  /** The bucket this vendor lands in most often, ignoring matched invoices. */
  topIssue: Gstr2bMatchStatus | null;
}

/**
 * Vendor lens rows. Pre-aggregated here rather than by the grid, because row grouping
 * with aggregation is an AG Grid Enterprise feature.
 */
export function buildVendorRows(rows: Gstr2bReconciliationRow[]): VendorRow[] {
  const byGstin = new Map<string, VendorRow & { buckets: Map<Gstr2bMatchStatus, number> }>();

  for (const row of rows) {
    const key = row.supplierGstin ?? '—';
    let vendor = byGstin.get(key);
    if (!vendor) {
      vendor = {
        id: `V-${key}`,
        supplierGstin: row.supplierGstin,
        supplierName: row.supplierName ?? null,
        invoices: 0,
        exceptions: 0,
        decided: 0,
        atRisk: 0,
        unclaimed: 0,
        topIssue: null,
        buckets: new Map(),
      };
      byGstin.set(key, vendor);
    }
    if (!vendor.supplierName && row.supplierName) vendor.supplierName = row.supplierName;
    vendor.invoices += 1;
    vendor.atRisk += num(row, 'atRisk');
    vendor.unclaimed += num(row, 'unclaimed');
    if (row.reconciliationAction && row.reconciliationAction !== 'PENDING') vendor.decided += 1;
    if (row.matchStatus !== 'MATCHED') {
      vendor.exceptions += 1;
      vendor.buckets.set(row.matchStatus, (vendor.buckets.get(row.matchStatus) ?? 0) + 1);
    }
  }

  return Array.from(byGstin.values())
    .map((vendor) => {
      let topIssue: Gstr2bMatchStatus | null = null;
      let best = 0;
      for (const [bucket, count] of vendor.buckets) {
        if (count > best) {
          best = count;
          topIssue = bucket;
        }
      }
      const { buckets: _buckets, ...rest } = vendor;
      void _buckets;
      return { ...rest, topIssue };
    })
    .sort((a, b) => b.atRisk + b.unclaimed - (a.atRisk + a.unclaimed));
}
