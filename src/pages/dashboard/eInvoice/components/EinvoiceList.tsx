import type { EinvoiceFiling, EinvoiceIrn } from '../types/einvoice.types';
import styles from './EinvoiceList.module.css';

interface EinvoiceListProps {
  filing: EinvoiceFiling | null;
  irns: EinvoiceIrn[];
  loading: boolean;
  retPeriod: string;
}

function formatAmount(v: number | null): string {
  if (v == null) return '—';
  return v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statusClass(status: string | null): string {
  if (status === 'ACT') return styles.statusActive;
  if (status === 'CNL') return styles.statusCancelled;
  return styles.statusDefault;
}

export function EinvoiceList({ filing, irns, loading, retPeriod }: EinvoiceListProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Invoices</h3>
          <p className={styles.subtitle}>
            {filing
              ? `${irns.length} invoice${irns.length === 1 ? '' : 's'} for period ${retPeriod} · Status: ${filing.syncStatus}`
              : `No data uploaded or synced yet for period ${retPeriod}`}
          </p>
        </div>
      </div>

      {loading && <p className={styles.emptyState}>Loading invoices…</p>}

      {!loading && filing && irns.length === 0 && (
        <p className={styles.emptyState}>This period has a filing but no invoice rows yet.</p>
      )}

      {!loading && !filing && (
        <p className={styles.emptyState}>Upload a file or sync from the GST portal to see invoices here.</p>
      )}

      {!loading && irns.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>IRN</th>
                <th>Supplier GSTIN</th>
                <th>Doc No.</th>
                <th>Doc Date</th>
                <th>Total Value</th>
                <th>Status</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {irns.map((row) => (
                <tr key={row.id}>
                  <td className={styles.irnCell} title={row.irn}>{row.irn}</td>
                  <td>{row.supplierGstin ?? '—'}</td>
                  <td>{row.docNum ?? '—'}</td>
                  <td>{row.docDate ?? '—'}</td>
                  <td>{formatAmount(row.totInvAmt)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${statusClass(row.irnStatus)}`}>
                      {row.irnStatus ?? '—'}
                    </span>
                  </td>
                  <td>{row.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
