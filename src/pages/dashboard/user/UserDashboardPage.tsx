import { useState, useEffect, Fragment, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { ROUTES } from '@/config/routes';
import styles from './UserDashboardPage.module.css';
import { AddNewGSTINModal } from './components/AddNewGSTINModal/AddNewGSTINModal';
import { UpgradePlanModal } from './components/UpgradePlanModal/UpgradePlanModal';
import { useMyCompanies } from './hooks/useMyCompanies';
import { useDeleteCompany } from './hooks/useDeleteCompany';
import { useCompanyGST } from './hooks/useCompanyGST';
import type { CompanyProfileResponse } from './types/company.types';
import { companyGSTApi } from './api/company-gst.api';
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

function GSTMappingCard({ gstId, companies, handleNavigateToEntity, onCompanyLoaded, onAddGst: _onAddGst, onUpgradePlan, filterCompanyId }: GSTMappingCardProps) {
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
        <div className={`${styles.alertBox} ${styles[defaultMock.alert.type]}`}>
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

function CompanyOnlyCard({ company, onAddGst }: { company: CompanyProfileResponse, onAddGst: (id: number) => void }) {
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

export function UserDashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlCompanyId = searchParams.get('companyId') ? Number(searchParams.get('companyId')) : null;

  const [isAddNewGSTINModalOpen, setAddNewGSTINModalOpen] = useState(false);
  const [mappedCompanyIds, setMappedCompanyIds] = useState<Set<number>>(new Set());
  const [selectedCompanyForGst, setSelectedCompanyForGst] = useState<number | null>(null);
  const [selectedGstForUpgrade, setSelectedGstForUpgrade] = useState<number | null>(null);
  const [isNewPurchaseMode, setIsNewPurchaseMode] = useState(false);
  
  const { data: companies, isLoading: isCompaniesLoading } = useMyCompanies();
  const deleteCompanyMutation = useDeleteCompany();

  useEffect(() => {
    const handleOpenModal = () => setAddNewGSTINModalOpen(true);
    const handleAddGstModal = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.companyId) {
        setSelectedCompanyForGst(customEvent.detail.companyId);
      }
    };
    window.addEventListener('open-add-new-gstin-modal', handleOpenModal);
    window.addEventListener('open-add-gst-modal', handleAddGstModal);
    return () => {
      window.removeEventListener('open-add-new-gstin-modal', handleOpenModal);
      window.removeEventListener('open-add-gst-modal', handleAddGstModal);
    };
  }, []);

  const handleNavigateToEntity = (gstId: number) => {
    localStorage.setItem('active_company_gst_id', String(gstId));
    navigate(ROUTES.dashboard.root);
  };

  const handleCompanyLoaded = useCallback((companyId: number) => {
    setMappedCompanyIds(prev => {
      if (prev.has(companyId)) return prev;
      const next = new Set(prev);
      next.add(companyId);
      return next;
    });
  }, []);

  // Filter by urlCompanyId if present, otherwise include all companies user has access to
  const activeCompanyIds = urlCompanyId ? [urlCompanyId] : (companies?.map(c => c.id) || []);

  const companyGstQueries = useQueries({
    queries: activeCompanyIds.map(companyId => ({
      queryKey: ['company-gsts', companyId],
      queryFn: () => companyGSTApi.getByCompany(companyId),
    }))
  });

  const allCompanyGsts = useMemo(() => {
    return companyGstQueries.flatMap(q => q.data || []);
  }, [companyGstQueries]);

  const isLoading = isCompaniesLoading || companyGstQueries.some(q => q.isLoading);
  const isError = companyGstQueries.some(q => q.isError);

  const allGstIdsToRender = Array.from(new Set(allCompanyGsts.map(g => g.id)));
  const unmappedCompanies = companies?.filter(c => activeCompanyIds.includes(c.id) && !mappedCompanyIds.has(c.id)) || [];
  const totalEntitiesCount = allGstIdsToRender.length + unmappedCompanies.length;
  const selectedCompanyObj = urlCompanyId ? companies?.find(c => c.id === urlCompanyId) : null;

  const handleDeleteCompany = async (companyId: number) => {
    if (window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      try {
        await deleteCompanyMutation.mutateAsync(companyId);
        navigate(ROUTES.dashboard.companies);
      } catch (error) {
        console.error('Failed to delete company:', error);
        alert('Failed to delete company. Please try again.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', minWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {urlCompanyId && (
                <Link to={ROUTES.dashboard.companies} style={{ textDecoration: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 500 }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  Back to Companies
                </Link>
              )}
            </div>
          </div>
          <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center' }}>
            {selectedCompanyObj ? selectedCompanyObj.companyName : 'Active Reconciliations'}
            {urlCompanyId && selectedCompanyObj && (
              <button
                onClick={() => handleDeleteCompany(selectedCompanyObj.id)}
                disabled={deleteCompanyMutation.isPending}
                className={styles.deleteCompanyBtn}
                title="Delete Company"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </h1>
          <p className={styles.subtitle}>{selectedCompanyObj ? 'Manage your GST numbers and filing progress for this company.' : 'Review and manage filing progress across your entities.'}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className={styles.badge}>FEB 2026</div>
        </div>
      </div>

      {isLoading ? (
        <p>Loading your entities...</p>
      ) : isError ? (
        <p>Error loading your entities.</p>
      ) : (
        <div className={styles.cardList}>
          {allGstIdsToRender.map((gstId) => (
            <GSTMappingCard 
              key={gstId} 
              gstId={gstId} 
              companies={companies} 
              handleNavigateToEntity={handleNavigateToEntity}
              onCompanyLoaded={handleCompanyLoaded}
              onAddGst={setSelectedCompanyForGst}
              onUpgradePlan={(gstId, isNew) => {
                setSelectedGstForUpgrade(gstId);
                setIsNewPurchaseMode(!!isNew);
              }}
              filterCompanyId={urlCompanyId}
            />
          ))}
          
          {unmappedCompanies.map((company) => (
            <CompanyOnlyCard key={`unmapped-${company.id}`} company={company} onAddGst={setSelectedCompanyForGst} />
          ))}
          
          {totalEntitiesCount === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              No entities found. Connect a new company to get started.
            </div>
          )}
        </div>
      )}

      {!isLoading && !isError && totalEntitiesCount > 0 && !urlCompanyId && (
        <div className={styles.pagination}>
          <div className={styles.pageInfo}>
            Showing <strong>1 to {totalEntitiesCount}</strong> of <strong>{totalEntitiesCount}</strong> entities
          </div>
          <div className={styles.pageControls}>
            <button className={styles.pageBtn}>&lt;</button>
            <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
            <button className={styles.pageBtn}>&gt;</button>
          </div>
        </div>
      )}

      {(isAddNewGSTINModalOpen || selectedCompanyForGst !== null) && (
        <AddNewGSTINModal
          initialCompanyId={selectedCompanyForGst}
          onClose={(companyId, isNew) => {
            setAddNewGSTINModalOpen(false);
            setSelectedCompanyForGst(null);
            if (typeof companyId === 'number') {
              if (isNew) {
                navigate(ROUTES.dashboard.companies);
              }
            }
          }}
        />
      )}

      {selectedGstForUpgrade !== null && (
        <UpgradePlanModal
          gstId={selectedGstForUpgrade}
          onClose={() => {
            setSelectedGstForUpgrade(null);
            setIsNewPurchaseMode(false);
          }}
          isNewPurchase={isNewPurchaseMode}
        />
      )}
    </div>
  );
}
