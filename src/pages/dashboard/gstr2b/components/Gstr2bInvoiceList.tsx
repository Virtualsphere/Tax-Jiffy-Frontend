import type { PrB2b, PurchaseRegisterFiling } from '@/pages/dashboard/purchaseRegister/api/purchaseRegisterApi';
import styles from './Gstr2bInvoiceList.module.css';

interface Gstr2bInvoiceListProps {
  filing: PurchaseRegisterFiling | null;
  invoices: PrB2b[];
  loading: boolean;
  retPeriod: string;
  /** Renders bare, without card chrome or header, for nesting inside another card. */
  embedded?: boolean;
}

function formatAmount(v: number | null): string {
  if (v == null) return '—';
  return v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function Gstr2bInvoiceList({ filing, invoices, loading, retPeriod, embedded = false }: Gstr2bInvoiceListProps) {
  const body = (
    <>
      {loading && <p className={styles.emptyState}>Loading invoices…</p>}

      {!loading && filing && invoices.length === 0 && (
        <p className={styles.emptyState}>This period has a filing but no B2B invoice rows yet.</p>
      )}

      {!loading && !filing && (
        <p className={styles.emptyState}>Upload a GSTR-2B file to see invoices here.</p>
      )}

      {!loading && invoices.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Supplier GSTIN</th>
                <th>Invoice No.</th>
                <th>Invoice Date</th>
                <th>Taxable Value</th>
                <th>Total Tax</th>
                <th>ITC Eligibility</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((row) => (
                <tr key={row.id}>
                  <td>{row.gstinOfSupplier ?? '—'}</td>
                  <td>{row.invoiceNumber ?? '—'}</td>
                  <td>{row.invoiceDate ?? '—'}</td>
                  <td>{formatAmount(row.taxableValue)}</td>
                  <td>{formatAmount(row.integratedTaxPaid + row.centralTaxPaid + row.stateUtTaxPaid + row.cessPaid)}</td>
                  <td>{row.eligibilityForItc ?? '—'}</td>
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
              ? `${invoices.length} invoice${invoices.length === 1 ? '' : 's'} for period ${retPeriod} · Status: ${filing.filingStatus}`
              : `No data uploaded yet for period ${retPeriod}`}
          </p>
        </div>
      </div>

      {body}
    </div>
  );
}
