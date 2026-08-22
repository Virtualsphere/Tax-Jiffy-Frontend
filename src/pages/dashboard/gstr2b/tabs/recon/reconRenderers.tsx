import type { ICellRendererParams } from 'ag-grid-community';
import type { Gstr2bMatchStatus, Gstr2bReconciliationRow } from '../../types/gstr2b-filing.types';
import type { VendorRow } from './reconAggregate';
import { BUCKET_META, isZero, money } from './reconMeta';
import styles from './Recon.module.css';

type AnyRow = Gstr2bReconciliationRow | VendorRow;

function isPinned(params: ICellRendererParams): boolean {
  return !!params.node.rowPinned;
}

/** Two-line supplier identity: trade name over GSTIN. Doubles as the pinned total label. */
export function SupplierCell(params: ICellRendererParams<AnyRow>) {
  if (isPinned(params)) {
    return <span className={styles.totalCell}>Total · rows in view</span>;
  }
  const data = params.data;
  if (!data) return null;
  const name = data.supplierName || data.supplierGstin || '—';
  const gstin = data.supplierGstin ?? '—';
  return (
    <span className={styles.sup}>
      <span className={styles.supName}>{name}</span>
      <span className={styles.supGstin}>{gstin}</span>
    </span>
  );
}

/** The "difference in" chip — a coloured dot plus the short bucket name. */
export function BucketCell(params: ICellRendererParams<AnyRow, Gstr2bMatchStatus | null>) {
  if (isPinned(params)) return null;
  const status = params.value;
  if (!status) return <span className={styles.quiet}>No issues</span>;
  const meta = BUCKET_META[status];
  if (!meta) return <span className={styles.quiet}>{String(status)}</span>;

  const edited = (params.data as Gstr2bReconciliationRow | undefined)?.edited;
  const corrected = edited ? <span className={`${styles.tag} ${styles.tagFix}`}>corrected</span> : null;

  if (status === 'MATCHED') {
    return (
      <span className={styles.whyWrap}>
        <span className={styles.quiet}>Matched</span>
        {corrected}
      </span>
    );
  }
  return (
    <span className={styles.whyWrap}>
      <span className={styles.why}>
        <span className={styles.whyDot} style={{ background: meta.color }} />
        {meta.short}
      </span>
      {corrected}
    </span>
  );
}

/** Credit the reconciliation cannot support — always reads in the loss colour. */
export function RiskCell(params: ICellRendererParams<AnyRow, number>) {
  if (isPinned(params)) return <span className={`${styles.num} ${styles.risk}`}>{money(params.value ?? 0)}</span>;
  if (isZero(params.value)) return <span className={`${styles.num} ${styles.numNil}`}>—</span>;
  return <span className={`${styles.num} ${styles.risk}`}>{money(params.value)}</span>;
}

/** Credit sitting unclaimed — the gain side. */
export function UnclaimedCell(params: ICellRendererParams<AnyRow, number>) {
  if (isPinned(params)) return <span className={`${styles.num} ${styles.unc}`}>{money(params.value ?? 0)}</span>;
  if (isZero(params.value)) return <span className={`${styles.num} ${styles.numNil}`}>—</span>;
  return <span className={`${styles.num} ${styles.unc}`}>{money(params.value)}</span>;
}

/** Signed per-head difference: negative reads as exposure, positive as headroom. */
export function DeltaCell(params: ICellRendererParams<AnyRow, number>) {
  const value = params.value;
  if (value == null) return null;
  if (isZero(value)) return <span className={`${styles.num} ${styles.numNil}`}>—</span>;
  const cls = value < 0 ? styles.risk : styles.unc;
  return (
    <span className={`${styles.num} ${cls}`}>
      {value > 0 ? '+' : '−'}
      {money(Math.abs(value))}
    </span>
  );
}

const ELIGIBILITY_CLASS: { test: RegExp; cls: string }[] = [
  { test: /17\s*\(?5\)?|ineligible|not\s*available|blocked/i, cls: styles.tagBlock },
  { test: /rcm|reverse/i, cls: styles.tagRcm },
  { test: /capital/i, cls: styles.tagCap },
];

export function EligibilityCell(params: ICellRendererParams<AnyRow, string | null>) {
  if (isPinned(params) || !params.value) return null;
  const match = ELIGIBILITY_CLASS.find((entry) => entry.test.test(params.value as string));
  return <span className={`${styles.tag} ${match ? match.cls : styles.tagElig}`}>{params.value}</span>;
}

export function ExceptionsCell(params: ICellRendererParams<VendorRow, number>) {
  if (isPinned(params)) return <span className={styles.num}>{params.value ?? 0}</span>;
  if (!params.value) return <span className={`${styles.num} ${styles.numNil}`}>—</span>;
  return <span className={`${styles.num} ${styles.risk}`}>{params.value}</span>;
}

export function VendorDecidedCell(params: ICellRendererParams<VendorRow, number>) {
  if (isPinned(params) || !params.data) return null;
  const { decided, invoices } = params.data;
  const done = decided >= invoices;
  return (
    <span className={`${styles.num} ${done ? styles.unc : ''}`}>
      {decided} / {invoices}
    </span>
  );
}

export function OpenInvoicesCell(params: ICellRendererParams<VendorRow>) {
  if (isPinned(params)) return null;
  return <span className={styles.open}>Open invoices →</span>;
}
