import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { ROUTES } from '@/config/routes';
import styles from './CompaniesDashboardPage.module.css';
import { useMyCompanies } from '../user/hooks/useMyCompanies';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useDeleteCompany } from '../user/hooks/useDeleteCompany';
import { companyGSTApi } from '../user/api/company-gst.api';

import { AddNewGSTINModal } from '../user/components/AddNewGSTINModal/AddNewGSTINModal';
import { UpgradePlanModal } from '../user/components/UpgradePlanModal/UpgradePlanModal';
import { EditDetailsModal } from '../user/components/EditDetailsModal/EditDetailsModal';

import { CompanyAccordionItem } from './components/CompanyAccordionItem/CompanyAccordionItem';
import { GSTMappingCard } from './components/GSTMappingCard/GSTMappingCard';
import { CompanyOnlyCard } from './components/CompanyOnlyCard/CompanyOnlyCard';

export function CompaniesDashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlCompanyId = searchParams.get('companyId') ? Number(searchParams.get('companyId')) : null;

  const [isAddNewGSTINModalOpen, setAddNewGSTINModalOpen] = useState(false);
  const [selectedCompanyForGst, setSelectedCompanyForGst] = useState<number | null>(null);
  const [selectedGstForUpgrade, setSelectedGstForUpgrade] = useState<number | null>(null);
  const [isNewPurchaseMode, setIsNewPurchaseMode] = useState(false);
  const [deletingCompanyId, setDeletingCompanyId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<{ companyId: number; companyName: string; companyLogo?: string; gstId?: number; gstin?: string } | null>(null);

  const { data: user } = useCurrentUser();
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

  const handleEditDetails = (companyId: number, gstId?: number) => {
    const company = companies?.find(c => c.id === companyId);
    if (!company) return;
    
    let gstin = '';
    if (gstId) {
      const gst = allCompanyGsts.find(g => g.id === gstId);
      if (gst) gstin = gst.gstNumber;
    }
    
    setEditTarget({
      companyId,
      companyName: company.companyName,
      companyLogo: company.companyLogo,
      gstId,
      gstin
    });
  };


  // Format today's date
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  // Current period badge (removed)

  return (
    <div className={styles.container}>
      {/* ═══ Welcome Banner ═══ */}
      <div className={styles.welcomeBanner}>
        <div className={styles.welcomeLeft}>
          <div className={styles.welcomeIcon}>👋</div>
          <div className={styles.welcomeContent}>
            <h1 className={styles.welcomeTitle}>Welcome, {user?.name?.split(' ')[0] || 'User'}! 👋</h1>
            <p className={styles.welcomeSubtitle}>Manage your GST numbers and stay compliant.</p>
          </div>
        </div>
        <div className={styles.welcomeDate}>
          <svg width="20" height="20" fill="none" stroke="#5a6acf" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div>
            <span className={styles.dateLabel}>Today is</span>
            <span className={styles.dateValue}>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* ═══ Section Header ═══ */}
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Your GSTIN</h2>
          <p className={styles.sectionSubtitle}>Manage and track all your GSTINs and filing progress.</p>
        </div>
      </div>

      {/* ═══ Company List ═══ */}
      {isLoading ? (
        <p>Loading your companies...</p>
      ) : isError ? (
        <p>Error loading your entities.</p>
      ) : (
        <div className={styles.accordionList}>
          {(() => {
            const filteredCompanies = (companies || []).filter(company => urlCompanyId ? company.id === urlCompanyId : true);
            const elements: React.ReactNode[] = [];

            filteredCompanies.forEach((company) => {
              const gstIds = getGstIdsForCompany(company.id);
              
              if (gstIds.length > 0) {
                // One accordion per GST
                gstIds.forEach(gstId => {
                  const gst = allCompanyGsts.find(g => g.id === gstId);
                  const itemId = `gst-${gstId}`;
                  elements.push(
                    <CompanyAccordionItem 
                      key={itemId} 
                      company={company}
                      isExpanded={expandedId === itemId}
                      onToggle={() => setExpandedId(expandedId === itemId ? null : itemId)}
                      onDelete={handleDeleteCompany}
                      onAddGst={setSelectedCompanyForGst}
                      isDeleting={deleteCompanyMutation.isPending}
                      gstNumber={gst?.gstNumber}
                      onOpenWorkspace={() => handleNavigateToEntity(gstId)}
                    >
                      <GSTMappingCard 
                        gstId={gstId} 
                        companies={companies} 
                        handleNavigateToEntity={handleNavigateToEntity}
                        onCompanyLoaded={handleCompanyLoaded}
                        onAddGst={setSelectedCompanyForGst}
                        onUpgradePlan={(id, isNew) => {
                          setSelectedGstForUpgrade(id);
                          setIsNewPurchaseMode(!!isNew);
                        }}
                        onEditDetails={handleEditDetails}
                        filterCompanyId={null}
                      />
                    </CompanyAccordionItem>
                  );
                });
              } else {
                // No GSTs, render one accordion for the company itself
                const itemId = `company-${company.id}`;
                elements.push(
                  <CompanyAccordionItem 
                    key={itemId} 
                    company={company}
                    isExpanded={expandedId === itemId}
                    onToggle={() => setExpandedId(expandedId === itemId ? null : itemId)}
                    onDelete={handleDeleteCompany}
                    onAddGst={setSelectedCompanyForGst}
                    isDeleting={deleteCompanyMutation.isPending}
                  >
                    <CompanyOnlyCard 
                      company={company} 
                      onAddGst={setSelectedCompanyForGst} 
                      onEditDetails={handleEditDetails}
                    />
                  </CompanyAccordionItem>
                );
              }
            });

            return elements;
          })()}
          
          {companies?.length === 0 && (
            <div className={styles.emptyState}>
              <svg width="48" height="48" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p>No companies found. Add a new company to get started.</p>
            </div>
          )}
        </div>
      )}



      {(isAddNewGSTINModalOpen || selectedCompanyForGst !== null) && (
        <AddNewGSTINModal
          initialCompanyId={selectedCompanyForGst}
          onClose={() => {
            setAddNewGSTINModalOpen(false);
            setSelectedCompanyForGst(null);
            // Optionally could navigate or highlight the new company
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

      {editTarget && (
        <EditDetailsModal
          onClose={() => setEditTarget(null)}
          companyId={editTarget.companyId}
          initialCompanyName={editTarget.companyName}
          initialCompanyLogo={editTarget.companyLogo}
          gstId={editTarget.gstId}
          initialGstin={editTarget.gstin}
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
