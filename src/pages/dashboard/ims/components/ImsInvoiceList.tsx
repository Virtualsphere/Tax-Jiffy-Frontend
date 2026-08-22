import type { ImsFiling, ImsInvoice } from '../types/ims.types';
import styles from './ImsInvoiceList.module.css';

interface ImsInvoiceListProps {
  filing: ImsFiling | null;
  invoices: ImsInvoice[];
  loading: boolean;
  retPeriod: string;
  /** Renders bare, without card chrome or header, for nesting inside another card. */
  embedded?: boolean;
}

function formatAmount(v: number | null): string {
  if (v == null) return '—';
  return v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function actionClass(action: string | null): string {
  if (action === 'ACCEPTED') return styles.actionAccepted;
  if (action === 'REJECTED') return styles.actionRejected;
  return styles.actionDefault;
}

export function ImsInvoiceList({ filing, invoices, loading, retPeriod, embedded = false }: ImsInvoiceListProps) {
  const body = (
    <>
      {loading && <p className={styles.emptyState}>Loading invoices…</p>}

      {!loading && filing && invoices.length === 0 && (
        <p className={styles.emptyState}>This period has a filing but no invoice rows yet.</p>
      )}

      {!loading && !filing && (
        <p className={styles.emptyState}>Upload a file or sync from the GST portal to see invoices here.</p>
      )}

      {!loading && invoices.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Section</th>
                <th>Supplier GSTIN</th>
                <th>Invoice No.</th>
                <th>Invoice Date</th>
                <th>Taxable Value</th>
                <th>Total Tax</th>
                <th>IMS Action</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((row) => (
                <tr key={row.id}>
                  <td>{row.section}</td>
                  <td>{row.supplierGstin ?? '—'}</td>
                  <td>{row.invoiceNumber ?? '—'}</td>
                  <td>{row.invoiceDate ?? '—'}</td>
                  <td>{formatAmount(row.taxableValue)}</td>
                  <td>{formatAmount(row.integratedTax + row.centralTax + row.stateUtTax + row.cess)}</td>
                  <td>
                    <span className={`${styles.actionBadge} ${actionClass(row.imsAction)}`}>
                      {row.imsAction ?? '—'}
                    </span>
                  </td>
                  <td>{row.source}</td>
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
          <h3 className={styles.title}>Invoices</h3>
          <p className={styles.subtitle}>
            {filing
              ? `${invoices.length} invoice${invoices.length === 1 ? '' : 's'} for period ${retPeriod} · Status: ${filing.syncStatus}`
              : `No data uploaded or synced yet for period ${retPeriod}`}
          </p>
        </div>
      </div>

      {body}
    </div>
  );
}
