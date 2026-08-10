import { UnifiedTable } from '@/components/UnifiedTable';
import type { ColDef } from 'ag-grid-community';
import { useEwaybillUnlinkedQuery } from '../hooks/useEwaybillReco';
import styles from '../GSTR1Page.module.css';

interface UnlinkedEwaybillModalProps {
  filingId: number;
  onClose: () => void;
}

export function UnlinkedEwaybillModal({ filingId, onClose }: UnlinkedEwaybillModalProps) {
  const { data: unlinkedData = [], isLoading } = useEwaybillUnlinkedQuery(filingId);

  const columnDefs: ColDef[] = [
    { field: 'invoiceNumbers', headerName: 'Invoice No.', flex: 1 },
    { field: 'recipientGstin', headerName: 'Recipient GSTIN', flex: 1 },
    {
      field: 'saleRegisterValue',
      headerName: 'Invoice Value',
      flex: 1,
      valueFormatter: (params) =>
        params.value != null ? `₹${params.value.toFixed(2)}` : '—',
    },
  ];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Action Required: Raise E-Way Bills</h2>
          <button className={styles.modalCloseBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalBody}>
          <p style={{ marginBottom: '1rem', color: '#475569' }}>
            The following invoices exist in your Sale Register but no e-way bill's document reference
            was found covering them. Please raise e-way bills for these records.
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
