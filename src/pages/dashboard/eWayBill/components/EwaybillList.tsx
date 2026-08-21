import type { EWayBillFiling, EWayBillRecord } from '../types/ewaybill.types';
import styles from './EwaybillList.module.css';

interface EwaybillListProps {
  filing: EWayBillFiling | null;
  records: EWayBillRecord[];
  loading: boolean;
  periodLabel: string;
  /** Renders bare, without card chrome or header, for nesting inside another card. */
  embedded?: boolean;
}

function formatAmount(v: number | null): string {
  if (v == null) return '—';
  return v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statusClass(status: string | null): string {
  const s = status?.toUpperCase();
  if (s === 'ACT' || s === 'ACTIVE') return styles.statusActive;
  if (s === 'CNL' || s === 'CANCELLED') return styles.statusCancelled;
  if (s === 'EXPIRING' || s === 'PENDING') return styles.statusWarning;
  return styles.statusDefault;
}

export function EwaybillList({
  filing,
  records,
  loading,
  periodLabel,
  embedded = false,
}: EwaybillListProps) {
  const body = (
    <>
      {loading && <p className={styles.emptyState}>Loading e-way bills…</p>}

      {!loading && filing && records.length === 0 && (
        <p className={styles.emptyState}>This filing has no e-way bill rows.</p>
      )}

      {!loading && !filing && (
        <p className={styles.emptyState}>
          Upload a file or sync from the GST portal to see e-way bills here.
        </p>
      )}

      {!loading && records.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>E-Way Bill No.</th>
                <th>EWB Date</th>
                <th>Doc No.</th>
                <th>Doc Date</th>
                <th>From GSTIN</th>
                <th>To GSTIN</th>
                <th>Invoice Value</th>
                <th>Status</th>
                <th>Valid Upto</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {records.map((row) => (
                <tr key={row.id}>
                  <td className={styles.ewbCell}>{row.ewbNo ?? '—'}</td>
                  <td>{row.ewbDate ?? '—'}</td>
                  <td>{row.docNo ?? '—'}</td>
                  <td>{row.docDate ?? '—'}</td>
                  <td title={row.fromTrdName ?? undefined}>{row.fromGstin ?? '—'}</td>
                  <td title={row.toTrdName ?? undefined}>{row.toGstin ?? '—'}</td>
                  <td>{formatAmount(row.totInvValue)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${statusClass(row.status)}`}>
                      {row.status ?? '—'}
                    </span>
                  </td>
                  <td>{row.validUpto ?? '—'}</td>
                  <td>{row.source ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  if (embedded) return body;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>E-Way Bills</h3>
          <p className={styles.subtitle}>
            {filing
              ? `${records.length} e-way bill${records.length === 1 ? '' : 's'} for ${periodLabel} · Status: ${filing.syncStatus}`
              : `No e-way bill data loaded for ${periodLabel}`}
          </p>
        </div>
      </div>

      {body}
    </div>
  );
}
