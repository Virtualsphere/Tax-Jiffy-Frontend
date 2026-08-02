import React, { useState } from 'react';
import { useUpdateCompany } from '../../hooks/useUpdateCompany';
import { useUpdateCompanyGST } from '../../hooks/useUpdateCompanyGST';
import { filesApi } from '@/lib/files.api';
import styles from '../AddNewGSTINModal/AddNewGSTINModal.module.css';

interface EditDetailsModalProps {
  onClose: () => void;
  companyId: number;
  initialCompanyName: string;
  initialCompanyLogo?: string;
  gstId?: number;
  initialGstin?: string;
}

export function EditDetailsModal({ 
  onClose, 
  companyId, 
  initialCompanyName, 
  initialCompanyLogo,
  gstId,
  initialGstin 
}: EditDetailsModalProps) {
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>(initialCompanyLogo || '');
  const [gstin, setGstin] = useState(initialGstin || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateCompany = useUpdateCompany();
  const updateGst = useUpdateCompanyGST();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCompanyLogoFile(file);
      setLogoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!companyName.trim()) {
      setErrorMessage("Please enter a company name.");
      return;
    }
    
    if (gstId && !gstin.trim()) {
      setErrorMessage("Please enter a GSTIN number.");
      return;
    }

    try {
      let uploadedLogoUrl = initialCompanyLogo || '';
      if (companyLogoFile) {
        try {
          const uploadRes = await filesApi.upload(companyLogoFile);
          uploadedLogoUrl = uploadRes.url;
        } catch (uploadErr) {
          console.error('Logo upload error:', uploadErr);
          setErrorMessage("Failed to upload company logo.");
          return;
        }
      }

      await updateCompany.mutateAsync({
        id: companyId,
        data: {
          companyName,
          companyLogo: uploadedLogoUrl,
        }
      });

      if (gstId) {
        await updateGst.mutateAsync({
          id: gstId,
          data: {
            gstNumber: gstin.toUpperCase(),
          }
        });
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || err.message || "An error occurred while updating details.");
    }
  };

  const isSubmitting = updateCompany.isPending || updateGst.isPending;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Edit Details</h2>
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
              <label className={styles.label} htmlFor="companyName">
                COMPANY NAME
              </label>
              <input
                id="companyName"
                type="text"
                className={styles.input}
                placeholder="e.g. Acme Corp"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="companyLogo">
                COMPANY LOGO (OPTIONAL)
              </label>
              <input
                id="companyLogo"
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

            {gstId && (
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
            )}

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
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
