import React, { useState } from 'react';
import { useCreateCompanyGST } from '../../hooks/useCreateCompanyGST';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import styles from '../ConnectEntityModal/ConnectEntityModal.module.css';
import { useQueryClient } from '@tanstack/react-query';

interface AddGSTModalProps {
  companyId: number;
  onClose: () => void;
}

export function AddGSTModal({ companyId, onClose }: AddGSTModalProps) {
  // GST Details State
  const [gstin, setGstin] = useState('');
  const [isEInvoiceApplicable, setIsEInvoiceApplicable] = useState<boolean>(false);
  const [effectiveDate, setEffectiveDate] = useState('');
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Queries
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  // Mutations
  const createGst = useCreateCompanyGST();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!gstin) return;
    if (isEInvoiceApplicable && !effectiveDate) {
      alert("Please enter an effective date for e-invoicing.");
      return;
    }
    
    try {
      // Create GST record only ΓÇö no subscription purchase required
      const newGst = await createGst.mutateAsync({
        companyId,
        gstNumber: gstin.toUpperCase(),
      });

      // The backend creates the GST record.
      // We will rely on fetching GSTs by company ID in the dashboard to display it.

      // After successful creation and mapping, refresh the dashboard lists
      queryClient.invalidateQueries({ queryKey: ['user-gst-mappings'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403) {
        setErrorMessage("Could not add GSTIN. The GSTIN number is likely already registered in the system (GST numbers must be unique) or there is an authorization issue with the remote server.");
      } else {
        setErrorMessage(err.response?.data?.message || err.message || "An error occurred while adding the GST details.");
      }
    }
  };

  const isSubmitting = createGst.isPending;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Add GST Details</h2>
          <button 
            className={styles.closeBtn} 
            onClick={onClose} 
            aria-label="Close" 
            disabled={isSubmitting}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.body}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="gstin">
                GSTIN NUMBER
              </label>
              <input
                id="gstin"
                type="text"
                className={styles.input}
                placeholder="e.g. 27AAACV1234F"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                IS E-INVOICE BILL APPLICABLE?
              </label>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: `1px solid ${isEInvoiceApplicable ? '#5a6acf' : '#cbd5e1'}`, borderRadius: '6px', cursor: 'pointer', flex: 1, justifyContent: 'center', background: isEInvoiceApplicable ? 'rgba(90, 106, 207, 0.05)' : 'transparent' }}>
                  <input type="radio" name="eInvoice" checked={isEInvoiceApplicable} onChange={() => setIsEInvoiceApplicable(true)} style={{ display: 'none' }} />
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Yes
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: `1px solid ${!isEInvoiceApplicable ? '#5a6acf' : '#cbd5e1'}`, borderRadius: '6px', cursor: 'pointer', flex: 1, justifyContent: 'center', background: !isEInvoiceApplicable ? 'rgba(90, 106, 207, 0.05)' : 'transparent' }}>
                  <input type="radio" name="eInvoice" checked={!isEInvoiceApplicable} onChange={() => setIsEInvoiceApplicable(false)} style={{ display: 'none' }} />
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  No
                </label>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="effectiveDate">
                EFFECTIVE DATE FOR E-INVOICE
              </label>
              <input
                id="effectiveDate"
                type="date"
                className={styles.input}
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                disabled={!isEInvoiceApplicable}
                required={isEInvoiceApplicable}
              />
            </div>

            <div style={{ padding: '12px 16px', background: 'rgba(90, 106, 207, 0.06)', borderRadius: '8px', marginTop: '4px' }}>
              <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                ≡ƒÆí You can purchase a subscription for this GSTIN later from your dashboard.
              </p>
            </div>

            {errorMessage && (
              <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '12px', lineHeight: '1.4', whiteSpace: 'pre-line' }}>
                {errorMessage}
              </p>
            )}
          </div>
          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button 
              type="submit" 
              className={styles.submitBtn} 
              disabled={!gstin || (isEInvoiceApplicable && !effectiveDate) || isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add GSTIN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
