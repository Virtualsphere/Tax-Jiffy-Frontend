import styles from '../GSTMappingCard/GSTMappingCard.module.css';
import type { CompanyProfileResponse } from '../../../user/types/company.types';
import { AuthenticatedImage } from '@/components/AuthenticatedImage/AuthenticatedImage';

export function CompanyOnlyCard({ company, onAddGst }: { company: CompanyProfileResponse, onAddGst: (id: number) => void }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardSection}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          {company.companyLogo && (
            <AuthenticatedImage src={company.companyLogo} alt="logo" style={{ width: 32, height: 32, borderRadius: 4 }} />
          )}
          <h2 className={styles.companyName}>Pending GST Details</h2>
        </div>
        <div className={styles.companyMeta}>
          No GSTIN Added Yet
        </div>
        <div className={styles.companyStatus}>
          Status: Incomplete
        </div>
      </div>
      
      <div className={styles.cardSection} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center' }}>
          Please add a GST number and purchase a subscription to activate this entity.
        </p>
      </div>

      <div className={styles.cardSection}>
        <div className={`${styles.alertBox} ${styles.info}`}>
          <div className={styles.alertHeader}>
            <span>ℹ</span>
            <span>INACTIVE</span>
          </div>
          <div className={styles.alertContent}>
            Action Required
          </div>
        </div>
        <div className={styles.cardAction}>
          <button 
            className={styles.actionBtn}
            onClick={() => onAddGst(company.id)}
          >
            Add GST →
          </button>
        </div>
      </div>
    </div>
  );
}
