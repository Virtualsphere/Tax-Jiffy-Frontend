import styles from '../GSTMappingCard/GSTMappingCard.module.css';
import type { CompanyProfileResponse } from '../../../user/types/company.types';

export function CompanyOnlyCard({ company, onAddGst, onEditDetails }: { company: CompanyProfileResponse, onAddGst: (id: number) => void, onEditDetails: (id: number) => void }) {
  return (
    <div className={styles.card} style={{ gridTemplateColumns: '1fr' }}>
      <div className={`${styles.cardSection} ${styles.noBorder}`} style={{ alignItems: 'center', padding: '40px 20px', textAlign: 'center' }}>
        <svg width="48" height="48" fill="none" stroke="#94a3b8" viewBox="0 0 24 24" style={{ marginBottom: '16px' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', margin: '0 0 8px 0' }}>No GSTIN Added Yet</h3>
        <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px 0', maxWidth: '400px' }}>
          Please add a GST number and purchase a subscription to activate this entity and start tracking returns.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button 
            className={styles.primaryActionBtn}
            onClick={() => onAddGst(company.id)}
            style={{ width: 'auto' }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add GST Number
          </button>
          
          <button 
            className={styles.secondaryActionBtn}
            onClick={() => onEditDetails(company.id)}
            style={{ width: 'auto', background: 'white' }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Company
          </button>
        </div>
      </div>
    </div>
  );
}
