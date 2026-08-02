import { useEffect } from 'react';
import styles from './GSTMappingCard.module.css';
import { useCompanyGST } from '../../../user/hooks/useCompanyGST';
import type { CompanyProfileResponse } from '../../../user/types/company.types';

interface GSTMappingCardProps {
  gstId: number;
  companies: CompanyProfileResponse[] | undefined;
  handleNavigateToEntity: (gstId: number) => void;
  onCompanyLoaded: (companyId: number) => void;
  onAddGst: (companyId: number) => void;
  onUpgradePlan: (gstId: number, isNew?: boolean, companyId?: number) => void;
  onEditDetails: (companyId: number, gstId: number) => void;
  filterCompanyId: number | null;
}

export function GSTMappingCard({ 
  gstId, 
  onCompanyLoaded, 
  handleNavigateToEntity,
  onUpgradePlan, 
  onEditDetails,
  filterCompanyId 
}: GSTMappingCardProps) {
  const { data: gst, isLoading } = useCompanyGST(gstId);

  useEffect(() => {
    if (gst?.companyId) {
      onCompanyLoaded(gst.companyId);
    }
  }, [gst?.companyId, onCompanyLoaded]);

  if (isLoading) {
    return (
      <div className={styles.card} style={{ justifyContent: 'center', padding: '24px' }}>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Loading entity details...</p>
      </div>
    );
  }

  if (!gst) return null;
  
  if (filterCompanyId && gst.companyId !== filterCompanyId) {
    return null;
  }

  // Mocked data to match design
  const returnsData = [
    { label: 'GSTR-1 (11th Mar)', status: 'Pending Payment', class: 'pendingPayment' },
    { label: 'GSTR-3B (20th Mar)', status: 'In Progress', class: 'inProgress' },
    { label: 'GSTR-9 (31st Dec)', status: 'Not Started Yet', class: 'notStarted' }
  ];

  const processData = [
    { title: 'Purchase Register Uploaded', sub: '3 minutes ago', state: 'completed' },
    { title: 'ITC Reconciliation', sub: 'Matches with 2B', state: 'completed' },
    { title: 'Payment & Filing', sub: 'Pending on portal', state: 'inProgress' },
    { title: 'Return Filing', sub: 'Upcoming', state: 'upcoming' }
  ];

  return (
    <div className={styles.card}>
      {/* ═══ Column 1: GST Returns Status ═══ */}
      <div className={styles.cardSection}>
        <div className={styles.sectionHeader}>
          <svg width="16" height="16" fill="none" stroke="#5a6acf" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3>GST Returns Status</h3>
        </div>
        
        <div className={styles.returnsList}>
          {returnsData.map((item, i) => (
            <div key={i} className={styles.returnItem}>
              <span className={styles.returnLabel}>{item.label}</span>
              <span className={`${styles.returnBadge} ${styles[item.class]}`}>{item.status}</span>
            </div>
          ))}
        </div>
        
        <button className={styles.viewAllBtn}>View All Returns &rarr;</button>
      </div>

      {/* ═══ Column 2: Process Timeline ═══ */}
      <div className={styles.cardSection}>
        <div className={styles.sectionHeader}>
          <svg width="16" height="16" fill="none" stroke="#5a6acf" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <h3>Process Timeline</h3>
        </div>
        
        <div className={styles.stepper}>
          {processData.map((step, i) => (
            <div key={i} className={styles.step}>
              {i < processData.length - 1 && <div className={`${styles.stepLine} ${step.state === 'completed' ? styles.lineCompleted : ''}`} />}
              <div className={`${styles.stepIcon} ${styles[step.state]}`}>
                {step.state === 'completed' ? (
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                ) : null}
              </div>
              <div className={styles.stepText}>
                <div className={`${styles.stepTitle} ${step.state === 'upcoming' ? styles.upcomingText : ''}`}>{step.title}</div>
                <div className={styles.stepSub}>{step.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Column 3: Quick Actions ═══ */}
      <div className={`${styles.cardSection} ${styles.noBorder}`}>
        <div className={styles.sectionHeader}>
          <svg width="16" height="16" fill="none" stroke="#5a6acf" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3>Quick Actions</h3>
        </div>
        
        <div className={styles.actionsList}>
          <button 
            className={styles.primaryActionBtn}
            onClick={() => handleNavigateToEntity(gst.id)}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Reconciliation Data &rarr;
          </button>
          
          <button className={styles.secondaryActionBtn}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Reports
          </button>
          
          {!gst.isPaymentDone && (
            <button 
              className={styles.secondaryActionBtn}
              onClick={() => onUpgradePlan(gst.id, true, gst.companyId)}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Buy Subscription &rarr;
            </button>
          )}

          <button 
            className={styles.secondaryActionBtn}
            onClick={() => onEditDetails(gst.companyId, gst.id)}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Details
          </button>
        </div>
      </div>
    </div>
  );
}
