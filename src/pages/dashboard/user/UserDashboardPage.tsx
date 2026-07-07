import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import styles from './UserDashboardPage.module.css';
import { ConnectEntityModal } from './components/ConnectEntityModal/ConnectEntityModal';
import { useCompanies } from './hooks/useCompanies';
import { useUserGSTMappings } from './hooks/useUserGSTMappings';
import { useCompanyGST } from './hooks/useCompanyGST';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { CompanyProfileResponse } from './types/company.types';
import type { UserGSTMappingResponse } from './types/user-gst-mapping.types';

interface GSTMappingCardProps {
  mapping: UserGSTMappingResponse;
  companies: CompanyProfileResponse[] | undefined;
  handleNavigateToEntity: (gstId: number) => void;
}

function GSTMappingCard({ mapping, companies, handleNavigateToEntity }: GSTMappingCardProps) {
  const { data: gst, isLoading } = useCompanyGST(mapping.companyGstId);

  if (isLoading) {
    return (
      <div className={styles.card} style={{ justifyContent: 'center', padding: '24px' }}>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Loading entity details...</p>
      </div>
    );
  }

  if (!gst) return null;

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
    gstin: gst.gstNumber,
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
      type: gst.isPaymentDone ? 'success' : 'info',
      icon: gst.isPaymentDone ? '✓' : 'ℹ',
      header: gst.isPaymentDone ? 'ACTIVE' : 'INACTIVE',
      content: gst.isPaymentDone ? `${gst.subscriptionPlanName || 'Plan'} Active` : 'Subscription Required'
    },
    actionLabel: 'Reconciliation Data →'
  };

  return (
    <div className={styles.card}>
      {/* Column 1: Info */}
      <div className={styles.cardSection}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          {companyLogo && (
            <img src={companyLogo} alt="logo" style={{ width: 32, height: 32, borderRadius: 4 }} />
          )}
          <h2 className={styles.companyName}>{gst.companyName}</h2>
        </div>
        <div className={styles.companyMeta}>
          {defaultMock.state} | GSTIN: {defaultMock.gstin}
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
        <div className={`${styles.alertBox} ${styles[defaultMock.alert.type]}`}>
          <div className={styles.alertHeader}>
            <span>{defaultMock.alert.icon}</span>
            <span>{defaultMock.alert.header}</span>
          </div>
          <div className={styles.alertContent}>
            {defaultMock.alert.content}
          </div>
        </div>
        <div className={styles.cardAction}>
          <button 
            className={styles.actionBtn}
            onClick={() => handleNavigateToEntity(gst.id)}
          >
            {defaultMock.actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function UserDashboardPage() {
  const navigate = useNavigate();
  const [isConnectModalOpen, setConnectModalOpen] = useState(false);
  
  const { data: user } = useCurrentUser();
  const userId = user ? Number(user.id) : undefined;

  const { data: companies, isLoading: isCompaniesLoading } = useCompanies();
  const { data: mappings, isLoading: isMappingsLoading, isError: isMappingsError } = useUserGSTMappings(userId);

  useEffect(() => {
    const handleOpenModal = () => setConnectModalOpen(true);
    window.addEventListener('open-connect-company-modal', handleOpenModal);
    return () => window.removeEventListener('open-connect-company-modal', handleOpenModal);
  }, []);

  const handleNavigateToEntity = (gstId: number) => {
    localStorage.setItem('active_company_gst_id', String(gstId));
    navigate(ROUTES.dashboard.root);
  };

  const isLoading = isCompaniesLoading || isMappingsLoading;
  const isError = isMappingsError;

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Active Reconciliations</h1>
          <p className={styles.subtitle}>Review and manage filing progress across your entities.</p>
        </div>
        <div className={styles.badge}>FEB 2026</div>
      </div>

      {isLoading ? (
        <p>Loading your entities...</p>
      ) : isError ? (
        <p>Error loading your entities.</p>
      ) : (
        <div className={styles.cardList}>
          {mappings?.map((mapping) => (
            <GSTMappingCard 
              key={mapping.id} 
              mapping={mapping} 
              companies={companies} 
              handleNavigateToEntity={handleNavigateToEntity} 
            />
          ))}
          
          {(!mappings || mappings.length === 0) && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              No entities found. Connect a new company & GSTIN to get started.
            </div>
          )}
        </div>
      )}

      {!isLoading && !isError && mappings && mappings.length > 0 && (
        <div className={styles.pagination}>
          <div className={styles.pageInfo}>
            Showing <strong>1 to {mappings.length}</strong> of <strong>{mappings.length}</strong> entities
          </div>
          <div className={styles.pageControls}>
            <button className={styles.pageBtn}>&lt;</button>
            <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
            <button className={styles.pageBtn}>&gt;</button>
          </div>
        </div>
      )}

      {isConnectModalOpen && (
        <ConnectEntityModal onClose={() => setConnectModalOpen(false)} />
      )}
    </div>
  );
}
