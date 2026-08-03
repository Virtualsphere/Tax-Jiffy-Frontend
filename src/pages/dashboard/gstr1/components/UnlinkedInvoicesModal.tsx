
import { UnifiedTable } from '@/components/UnifiedTable';
import type { ColDef } from 'ag-grid-community';
import { useUnlinkedQuery } from '../hooks/useEInvoiceReco';
import styles from '../GSTR1Page.module.css';

interface UnlinkedInvoicesModalProps {
  filingId: number;
  onClose: () => void;
}

export function UnlinkedInvoicesModal({ filingId, onClose }: UnlinkedInvoicesModalProps) {
  const { data: unlinkedData = [], isLoading } = useUnlinkedQuery(filingId);

  const columnDefs: ColDef[] = [
    { field: 'invoiceNumber', headerName: 'Invoice No.', flex: 1 },
    { field: 'recipientGstin', headerName: 'Recipient GSTIN', flex: 1 },
    {
      field: 'saleRegisterInvoiceValue',
      headerName: 'Invoice Value',
      flex: 1,
      valueFormatter: (params) =>
        params.value != null ? `₹${params.value.toFixed(2)}` : '—',
    },
    {
      field: 'saleRegisterTaxableValue',
      headerName: 'Taxable Value',
      flex: 1,
      valueFormatter: (params) =>
        params.value != null ? `₹${params.value.toFixed(2)}` : '—',
    },
  ];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Action Required: Raise E-Invoices</h2>
          <button className={styles.modalCloseBtn} onClick={onClose}>✕</button>
        </div>
        
        <div className={styles.modalBody}>
          <p style={{ marginBottom: '1rem', color: '#475569' }}>
            The following invoices exist in your Sale Register but no matching E-Invoice (IRN) was found on the GST portal.
            Please go to the government portal and raise e-invoices for these records.
          </p>

          <div style={{ height: '400px' }}>
            {isLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Loading unlinked invoices...</div>
            ) : (
              <UnifiedTable
                rowData={unlinkedData}
                columnDefs={columnDefs}
                variant="nested"
                hideFilterBar
              />
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.modalCancelBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
