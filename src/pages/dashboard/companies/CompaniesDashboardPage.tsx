import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { ROUTES } from '@/config/routes';
import styles from './CompaniesDashboardPage.module.css';
import { useMyCompanies } from '../user/hooks/useMyCompanies';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useDeleteCompany } from '../user/hooks/useDeleteCompany';
import { companyGSTApi } from '../user/api/company-gst.api';

import { ConnectEntityModal } from '../user/components/ConnectEntityModal/ConnectEntityModal';
import { AddGSTModal } from '../user/components/AddGSTModal/AddGSTModal';
import { UpgradePlanModal } from '../user/components/UpgradePlanModal/UpgradePlanModal';

import { CompanyAccordionItem } from './components/CompanyAccordionItem/CompanyAccordionItem';
import { GSTMappingCard } from './components/GSTMappingCard/GSTMappingCard';
import { CompanyOnlyCard } from './components/CompanyOnlyCard/CompanyOnlyCard';

export function CompaniesDashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlCompanyId = searchParams.get('companyId') ? Number(searchParams.get('companyId')) : null;

  const [isConnectModalOpen, setConnectModalOpen] = useState(false);
  const [selectedCompanyForGst, setSelectedCompanyForGst] = useState<number | null>(null);
  const [selectedGstForUpgrade, setSelectedGstForUpgrade] = useState<number | null>(null);
  const [isNewPurchaseMode, setIsNewPurchaseMode] = useState(false);
  const [deletingCompanyId, setDeletingCompanyId] = useState<number | null>(null);
  const [expandedCompanyId, setExpandedCompanyId] = useState<number | null>(urlCompanyId);

  useCurrentUser();
  const { data: companies, isLoading: isCompaniesLoading } = useMyCompanies();
  const deleteCompanyMutation = useDeleteCompany();

  useEffect(() => {
    const handleOpenModal = () => setConnectModalOpen(true);
    const handleAddGstModal = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.companyId) {
        setSelectedCompanyForGst(customEvent.detail.companyId);
      }
    };
    window.addEventListener('open-connect-company-modal', handleOpenModal);
    window.addEventListener('open-add-gst-modal', handleAddGstModal);
    return () => {
      window.removeEventListener('open-connect-company-modal', handleOpenModal);
      window.removeEventListener('open-add-gst-modal', handleAddGstModal);
    };
  }, []);

  const handleNavigateToEntity = (gstId: number) => {
    localStorage.setItem('active_company_gst_id', String(gstId));
    navigate(ROUTES.dashboard.root);
  };

  const handleCompanyLoaded = useCallback((_companyId: number) => {
    // No-op for now, retained for GSTMappingCard compatibility
  }, []);

  const handleDeleteCompany = (companyId: number) => {
    setDeletingCompanyId(companyId);
  };

  const confirmDeleteCompany = async () => {
    if (!deletingCompanyId) return;
    try {
      await deleteCompanyMutation.mutateAsync(deletingCompanyId);
      setDeletingCompanyId(null);
    } catch (error) {
      console.error('Failed to delete company:', error);
      alert('Failed to delete company. Please try again.');
    }
  };

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

  const getGstIdsForCompany = (companyId: number) => {
    return allCompanyGsts.filter(g => g.companyId === companyId).map(g => g.id);
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>My Companies</h1>
          <p className={styles.subtitle}>Select a company to view its active GST reconciliations.</p>
        </div>
        <button 
          className={styles.addCompanyBtn}
          onClick={() => setConnectModalOpen(true)}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Company
        </button>
      </div>

      {isLoading ? (
        <p>Loading your companies...</p>
      ) : isError ? (
        <p>Error loading your entities.</p>
      ) : (
        <div className={styles.accordionList}>
          {(companies || [])
            .filter(company => urlCompanyId ? company.id === urlCompanyId : true)
            .map((company) => {
            const gstIds = getGstIdsForCompany(company.id);
            const hasGsts = gstIds.length > 0;
            
            return (
              <CompanyAccordionItem 
                key={company.id} 
                company={company}
                isExpanded={expandedCompanyId === company.id}
                onToggle={() => setExpandedCompanyId(expandedCompanyId === company.id ? null : company.id)}
                onDelete={handleDeleteCompany}
                onAddGst={setSelectedCompanyForGst}
                isDeleting={deleteCompanyMutation.isPending}
              >
                {hasGsts ? (
                  gstIds.map(gstId => (
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
                      filterCompanyId={null}
                    />
                  ))
                ) : (
                  <CompanyOnlyCard 
                    company={company} 
                    onAddGst={setSelectedCompanyForGst} 
                  />
                )}
              </CompanyAccordionItem>
            );
          })}
          
          {companies?.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              No companies found. Add a new company to get started.
            </div>
          )}
        </div>
      )}

      {isConnectModalOpen && (
        <ConnectEntityModal onClose={(companyId, isNew) => {
          setConnectModalOpen(false);
          // If we want to navigate to the specific company accordion, we can set search params
          // But since they are all on this page, maybe just let it refresh.
          if (typeof companyId === 'number') {
            if (!isNew) {
              setSelectedCompanyForGst(companyId);
            }
          }
        }} />
      )}

      {selectedCompanyForGst !== null && (
        <AddGSTModal
          companyId={selectedCompanyForGst}
          onClose={() => setSelectedCompanyForGst(null)}
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

      {deletingCompanyId !== null && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setDeletingCompanyId(null)}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h4 className={styles.modalTitle}>Delete Company</h4>
              <button className={styles.closeBtn} onClick={() => setDeletingCompanyId(null)} aria-label="Close">×</button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.deleteMessage}>
                Are you sure you want to delete this company?{' '}
                <strong>This action cannot be undone.</strong>
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className={styles.cancelBtn} onClick={() => setDeletingCompanyId(null)}>
                Cancel
              </button>
              <button
                type="button"
                className={styles.deleteConfirmBtn}
                onClick={confirmDeleteCompany}
                disabled={deleteCompanyMutation.isPending}
              >
                {deleteCompanyMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
