import type { Gstr2bMatchStatus } from '../../types/gstr2b-filing.types';

export interface BucketMeta {
  /** Long name, as used in the tab strip and the statement. */
  label: string;
  /** Compact name for the legend and the in-grid chip. */
  short: string;
  color: string;
  /** Row-status class applied by rowClassRules. */
  rowClass: string;
}

export const BUCKET_META: Record<Gstr2bMatchStatus, BucketMeta> = {
  ONLY_IN_IMS: { label: 'Not in GSTR-2B', short: 'Not in 2B', color: '#be123c', rowClass: 'recon-row-risk' },
  TAXABLE_VALUE_DIFFERS: { label: 'Taxable Value Differs', short: 'Value differs', color: '#b45309', rowClass: 'recon-row-warn' },
  TAX_AMOUNT_DIFFERS: { label: 'Tax Amount Differs', short: 'Rate differs', color: '#d97706', rowClass: 'recon-row-warn' },
  TAX_HEAD_DIFFERS_POS: { label: 'Wrong Tax Head (POS)', short: 'Wrong tax head', color: '#7c2d92', rowClass: 'recon-row-head' },
  ONLY_IN_2B: { label: 'Not in IMS', short: 'Not in IMS', color: '#0369a1', rowClass: 'recon-row-warn' },
  ROUNDING_DIFFERENCE: { label: 'Rounding', short: 'Rounding', color: '#94a3b8', rowClass: '' },
  MATCHED: { label: 'Matched', short: 'Matched', color: '#0f766e', rowClass: 'recon-row-quiet' },
};

/** Worst exposure first, settled buckets last — the order the statement and legend read in. */
export const BUCKET_ORDER: Gstr2bMatchStatus[] = [
  'ONLY_IN_IMS',
  'TAXABLE_VALUE_DIFFERS',
  'TAX_AMOUNT_DIFFERS',
  'TAX_HEAD_DIFFERS_POS',
  'ONLY_IN_2B',
  'ROUNDING_DIFFERENCE',
  'MATCHED',
];

/**
 * Standard resolution per bucket. `fix` is the one-line label shown in the statement,
 * `act` the guidance carried into the context bar once a bucket is being worked.
 */
export const PLAYBOOK: Record<Gstr2bMatchStatus, { fix: string; act: string }> = {
  MATCHED: {
    fix: 'Accept',
    act: 'GSTR-2B and IMS agree on every head. Accept and claim in full.',
  },
  ROUNDING_DIFFERENCE: {
    fix: 'Accept within tolerance',
    act: 'A sub-rupee gap per head — the supplier rounded tax to the rupee. Accept, and align the GSTR-2B figure to IMS so the same paisa does not resurface next month.',
  },
  TAXABLE_VALUE_DIFFERS: {
    fix: 'Correct GSTR-2B / seek DN–CN',
    act: 'Pull the invoice copy. If the GSTR-2B line carries the wrong value, correct it here. If the supplier filed the wrong value, ask for a credit or debit note, or a GSTR-1 amendment.',
  },
  TAX_AMOUNT_DIFFERS: {
    fix: 'Verify rate & HSN',
    act: 'Check the HSN against the current rate notification — these cluster during a rate transition. Correct the GSTR-2B line, or have the supplier amend GSTR-1. Claim the lower of the two figures until it is settled.',
  },
  TAX_HEAD_DIFFERS_POS: {
    fix: 'Swap tax head',
    act: 'Confirm the place of supply. If the GSTR-2B line is wrong, swap the head here. If the supplier is wrong, they must amend GSTR-1 — IGST credit cannot be set off against a CGST/SGST entry, so this credit is blocked, not merely disputed.',
  },
  ONLY_IN_2B: {
    fix: 'Confirm against IMS',
    act: 'The invoice is in GSTR-2B with no IMS counterpart. Confirm it belongs to this period and record it in IMS — until it does, there is nothing to reconcile it against.',
  },
  ONLY_IN_IMS: {
    fix: 'Chase supplier GSTR-1',
    act: 'The supplier has not filed GSTR-1, or filed against a different GSTIN. Chase them and verify your GSTIN on the invoice. Not claimable under s.16(2)(aa) until it appears in GSTR-2B.',
  },
};

/** Books-side corrections. IMS is never touched. */
export type BulkFixKind = 'match' | 'swap';

export type BucketBulkAction =
  | { label: string; kind: 'decision'; action: 'ACCEPT' | 'REJECT' | 'PENDING' }
  | { label: string; kind: 'fix'; fix: BulkFixKind };

/**
 * A safe, deterministic one-click action per bucket. Buckets needing invoice-by-invoice
 * judgement deliberately get none — and neither do the two "only on one side" buckets,
 * where there is no counterpart to copy from.
 */
export const BUCKET_BULK: Partial<Record<Gstr2bMatchStatus, BucketBulkAction>> = {
  MATCHED: { label: 'Accept all', kind: 'decision', action: 'ACCEPT' },
  ROUNDING_DIFFERENCE: { label: 'Accept all', kind: 'decision', action: 'ACCEPT' },
  TAX_HEAD_DIFFERS_POS: { label: 'Swap tax head on all', kind: 'fix', fix: 'swap' },
};

const inr2 = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const inr0 = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

/** Two-decimal amount. Blank stays blank so pinned/aggregate cells can opt out. */
export function money(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return '—';
  return inr2.format(v);
}

/** Whole-rupee amount, for headline figures where paise are noise. */
export function moneyRounded(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return '0';
  return inr0.format(v);
}

export function isZero(v: number | null | undefined): boolean {
  return v == null || Math.abs(v) < 0.005;
}
