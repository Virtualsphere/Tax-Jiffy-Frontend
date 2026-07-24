import React, { useState } from 'react';
import { useCreateCompany } from '../../hooks/useCreateCompany';
import { filesApi } from '@/lib/files.api';
import styles from './ConnectEntityModal.module.css';

interface ConnectEntityModalProps {
  onClose: (companyIdToGst?: number, isNew?: boolean) => void;
}

export function ConnectEntityModal({ onClose }: ConnectEntityModalProps) {
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyLogoFile, setNewCompanyLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createCompany = useCreateCompany();

  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
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
      onClose(res.id, true);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || err.message || "An error occurred while creating the company.");
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewCompanyLogoFile(file);
      setLogoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const isSubmitting = createCompany.isPending;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Create Company</h2>
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
        
        <form onSubmit={handleSubmitFinal}>
          <div className={styles.body}>
            <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
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
                  required
                />
              </div>
              <div className={styles.field}>
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
            <button type="submit" className={styles.submitBtn} disabled={!newCompanyName.trim() || isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
