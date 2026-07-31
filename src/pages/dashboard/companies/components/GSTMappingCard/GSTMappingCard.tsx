import { Fragment, useEffect } from 'react';
import styles from './GSTMappingCard.module.css';
import { useCompanyGST } from '../../../user/hooks/useCompanyGST';
import type { CompanyProfileResponse } from '../../../user/types/company.types';
import { AuthenticatedImage } from '@/components/AuthenticatedImage/AuthenticatedImage';

interface GSTMappingCardProps {
  gstId: number;
  companies: CompanyProfileResponse[] | undefined;
  handleNavigateToEntity: (gstId: number) => void;
  onCompanyLoaded: (companyId: number) => void;
  onAddGst: (companyId: number) => void;
  onUpgradePlan: (gstId: number, isNew?: boolean, companyId?: number) => void;
  filterCompanyId: number | null;
}

export function GSTMappingCard({ 
  gstId, 
  companies, 
  handleNavigateToEntity, 
  onCompanyLoaded, 
  onAddGst: _onAddGst, 
  onUpgradePlan, 
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

  // Find logo from the companies list
  const companyInfo = companies?.find((c) => c.id === gst.companyId);
  const companyLogo = companyInfo?.companyLogo;

  const stateCode = gst.gstNumber.substring(0, 2);
  const stateName = stateCode === '27' ? 'Maharashtra' 
                  : stateCode === '29' ? 'Karnataka' 
                  : stateCode === '07' ? 'Delhi' 
                  : stateCode === '19' ? 'West Bengal' 
                  : 'State (Other)';

  const defaultMock = {
    state: stateName,
    statusMonth: 'July 2025',
    businessType: 'REGULAR',
    filings: [
      { label: 'GSTR-1 (11th Mar):', status: gst.isPaymentDone ? 'Filed' : 'Pending Payment', class: gst.isPaymentDone ? 'filed' : 'notStarted' },
      { label: 'GSTR-3B (20th Mar):', status: 'In Process', class: 'inProcess' },
      { label: 'GSTR-9 (31st Dec):', status: 'Not Started Yet', class: 'notStarted' }
    ],
    process: {
      title: 'GSTR-3B PROCESS',
      steps: [
        { title: 'Purchase register uploaded', sub: '3 minutes ago', state: 'completed' },
        { title: 'ITC Reconciliation', sub: 'Matches with 2B', state: 'completed' },
        { title: 'Payment & Filing', sub: 'Pending on portal', state: 'inProgress' }
      ]
    },
    alert: {
      type: gst.isPaymentDone ? 'success' : 'icon', // fallback, actual type is success or info
      icon: gst.isPaymentDone ? '✓' : 'ℹ',
      header: gst.isPaymentDone ? 'ACTIVE' : 'INACTIVE',
      content: gst.isPaymentDone ? `${gst.subscriptionPlanName || 'Plan'} Active` : 'Subscription Required'
    },
    actionLabel: 'Reconciliation Data →'
  };

  // fix type for alert type mapping
  const alertType = gst.isPaymentDone ? 'success' : 'info';

  return (
    <div className={styles.card}>
      {/* Column 1: Info */}
      <div className={styles.cardSection}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          {companyLogo && (
            <AuthenticatedImage src={companyLogo} alt="logo" style={{ width: 32, height: 32, borderRadius: 4 }} />
          )}
          <h2 className={styles.companyName}>{gst.gstNumber}</h2>
        </div>
        <div className={styles.companyMeta}>
          {defaultMock.state}
        </div>
        <div className={styles.companyStatus}>
          Filing Status: {defaultMock.statusMonth}
        </div>
        <div className={styles.businessType}>{defaultMock.businessType}</div>
        
        <div className={styles.filingGrid}>
          {defaultMock.filings.map((f, i) => (
            <Fragment key={i}>
              <span className={styles.filingItemLabel}>{f.label}</span>
              <span className={`${styles.filingBadge} ${styles[f.class]}`}>{f.status}</span>
            </Fragment>
          ))}
        </div>
      </div>

      {/* Column 2: Process */}
      <div className={styles.cardSection}>
        <div className={styles.processTitle}>{defaultMock.process.title}</div>
        <div className={styles.stepper}>
          {defaultMock.process.steps.map((step, i) => (
            <div key={i} className={styles.step}>
              {i < defaultMock.process.steps.length - 1 && <div className={styles.stepLine} />}
              <div className={`${styles.stepIcon} ${styles[step.state]}`}>
                {step.state === 'completed' ? (
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                ) : null}
              </div>
              <div className={styles.stepText}>
                <div className={`${styles.stepTitle} ${step.state === 'pending' ? styles.pending : ''}`}>{step.title}</div>
                <div className={styles.stepSub}>{step.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Column 3: Alert & Action */}
      <div className={styles.cardSection}>
        <div className={`${styles.alertBox} ${styles[alertType]}`}>
          <div className={styles.alertHeader}>
            <span>{defaultMock.alert.icon}</span>
            <span>{defaultMock.alert.header}</span>
          </div>
          <div className={styles.alertContent}>
            <div>{defaultMock.alert.content}</div>
          </div>
        </div>
        <div className={styles.cardAction} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            className={styles.actionBtn}
            onClick={() => handleNavigateToEntity(gst.id)}
          >
            Reconciliation Data &rarr;
          </button>
          {gst.subscriptionPlanName?.toLowerCase().includes('basic') && gst.isPaymentDone && (
            <button 
              className={styles.buySubscriptionBtn}
              onClick={() => onUpgradePlan(gst.id, false, gst.companyId)}
            >
              Buy Subscription &rarr;
            </button>
          )}
          {!gst.isPaymentDone && (
            <button 
              className={styles.buySubscriptionBtn}
              onClick={() => onUpgradePlan(gst.id, true, gst.companyId)}
            >
              Buy Subscription &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
