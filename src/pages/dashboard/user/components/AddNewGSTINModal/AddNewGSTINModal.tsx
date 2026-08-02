import React, { useState } from 'react';
import { useCreateCompany } from '../../hooks/useCreateCompany';
import { useCreateCompanyGST } from '../../hooks/useCreateCompanyGST';
import { useMyCompanies } from '../../hooks/useMyCompanies';
import { filesApi } from '@/lib/files.api';
import styles from './AddNewGSTINModal.module.css';
import { useQueryClient } from '@tanstack/react-query';

interface AddNewGSTINModalProps {
  onClose: (companyIdToGst?: number, isNew?: boolean) => void;
  initialCompanyId?: number | null;
}

export function AddNewGSTINModal({ onClose, initialCompanyId }: AddNewGSTINModalProps) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(initialCompanyId ? String(initialCompanyId) : 'new');
  
  // Company state
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyLogoFile, setNewCompanyLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>('');

  // GST State
  const [gstin, setGstin] = useState('');
  const [isEInvoiceApplicable, setIsEInvoiceApplicable] = useState<boolean>(false);
  const [effectiveDate, setEffectiveDate] = useState('');
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: companies, isLoading: isCompaniesLoading } = useMyCompanies();
  const createCompany = useCreateCompany();
  const createGst = useCreateCompanyGST();
  const queryClient = useQueryClient();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewCompanyLogoFile(file);
      setLogoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!gstin.trim()) {
      setErrorMessage("Please enter a GSTIN number.");
      return;
    }
    
    if (isEInvoiceApplicable && !effectiveDate) {
      setErrorMessage("Please enter an effective date for e-invoicing.");
      return;
    }

    try {
      let finalCompanyId: number;

      if (selectedCompanyId === 'new') {
        if (!newCompanyName.trim()) {
          setErrorMessage("Please enter a company name.");
          return;
        }

        let uploadedLogoUrl = '';
        if (newCompanyLogoFile) {
          try {
            const uploadRes = await filesApi.upload(newCompanyLogoFile);
            uploadedLogoUrl = uploadRes.url;
          } catch (uploadErr) {
            console.error('Logo upload error:', uploadErr);
            setErrorMessage("Failed to upload company logo.");
            return;
          }
        }

        const res = await createCompany.mutateAsync({
          companyName: newCompanyName,
          companyLogo: uploadedLogoUrl,
        });
        finalCompanyId = res.id;
      } else {
        finalCompanyId = Number(selectedCompanyId);
      }

      await createGst.mutateAsync({
        companyId: finalCompanyId,
        gstNumber: gstin.toUpperCase(),
      });

      queryClient.invalidateQueries({ queryKey: ['user-gst-mappings'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company-gsts', finalCompanyId] });

      onClose(finalCompanyId, selectedCompanyId === 'new');
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403) {
        setErrorMessage("Could not add GSTIN. The GSTIN number is likely already registered in the system (GST numbers must be unique) or there is an authorization issue with the remote server.");
      } else {
        setErrorMessage(err.response?.data?.message || err.message || "An error occurred while adding the details.");
      }
    }
  };

  const isSubmitting = createCompany.isPending || createGst.isPending;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Add New GSTIN</h2>
          <button 
            className={styles.closeBtn} 
            onClick={() => onClose()} 
            aria-label="Close" 
            disabled={isSubmitting}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto' }}>
          <div className={styles.body}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="companySelect">
                SELECT COMPANY
              </label>
              <select
                id="companySelect"
                className={styles.input}
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                disabled={isCompaniesLoading}
              >
                <option value="new">+ Create New Company</option>
                {companies?.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.companyName}
                  </option>
                ))}
              </select>
            </div>

            {selectedCompanyId === 'new' && (
              <div style={{ animation: 'fadeIn 0.2s ease-out', padding: '16px', background: 'rgba(90, 106, 207, 0.03)', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="newCompanyName">
                    COMPANY NAME
                  </label>
                  <input
                    id="newCompanyName"
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Acme Corp"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    required={selectedCompanyId === 'new'}
                  />
                </div>
                <div className={styles.field} style={{ marginBottom: 0 }}>
                  <label className={styles.label} htmlFor="newCompanyLogo">
                    COMPANY LOGO (OPTIONAL)
                  </label>
                  <input
                    id="newCompanyLogo"
                    type="file"
                    accept="image/*"
                    className={styles.input}
                    onChange={handleLogoChange}
                  />
                  {logoPreviewUrl && (
                    <div style={{ marginTop: '12px' }}>
                      <img src={logoPreviewUrl} alt="Logo Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                    </div>
                  )}
                </div>
              </div>
            )}

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
              <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '12px', lineHeight: '1.4' }}>
                {errorMessage}
              </p>
            )}
          </div>
          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={() => onClose()} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={!gstin.trim() || isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save & Add GSTIN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
