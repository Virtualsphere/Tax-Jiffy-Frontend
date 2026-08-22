import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';

import { AnimatedExpandable } from '@/components/AnimatedExpandable/AnimatedExpandable';
import { SimpleUploadUI } from '@/components/SimpleUploadUI/SimpleUploadUI';
import { PeriodSelector } from '@/components/PeriodSelector/PeriodSelector';
import { usePeriod, FY_YEARS } from '@/context/PeriodContext';
import { useCurrentEntity } from '@/hooks/useCurrentEntity';
import { toRetPeriod } from '@/lib/period';
import { describeApiError } from '@/lib/api-error';
import styles from './GSTR2BPage.module.css';
import { useGstr2bData } from './hooks/useGstr2bData';
import {
  purchaseRegisterApi,
  type PrB2b,
  type PurchaseRegisterFiling,
} from '@/pages/dashboard/purchaseRegister/api/purchaseRegisterApi';
import { Gstr2bInvoiceList } from './components/Gstr2bInvoiceList';
import { Gstr2bReconciliationPanel } from './tabs/Gstr2bReconciliationPanel';

/* ── Icons ── */
function IconGSTIN() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <text x="6" y="16" fontSize="7" fontWeight="bold" stroke="none" fill="currentColor" fontFamily="sans-serif">123</text>
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
      <path d="M9 22v-4h6v4"></path>
      <path d="M8 6h.01"></path>
      <path d="M16 6h.01"></path>
      <path d="M12 6h.01"></path>
      <path d="M12 10h.01"></path>
      <path d="M12 14h.01"></path>
      <path d="M16 10h.01"></path>
      <path d="M16 14h.01"></path>
      <path d="M8 10h.01"></path>
      <path d="M8 14h.01"></path>
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );
}

function IconStore() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  );
}

function IconCalendarCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
      <path d="M9 16l2 2 4-4"></path>
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );
}

function IconVerified() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}


const MAIN_TABS = ['Import', '2B-Reco', 'Return'] as const;
type MainTab = typeof MAIN_TABS[number];

export function GSTR2BPage() {
  const navigate = useNavigate();
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('Import');
  const [isAccordionAExpanded, setIsAccordionAExpanded] = useState(false);
  const [isAccordionBExpanded, setIsAccordionBExpanded] = useState(false);
  const [isUnavailableAExpanded, setIsUnavailableAExpanded] = useState(false);
  const [isUnavailableBExpanded, setIsUnavailableBExpanded] = useState(false);
  const [isFiled, setIsFiled] = useState(false);

  const { data, isLoading } = useGstr2bData();

  const { data: currentEntity } = useCurrentEntity();
  const { selectedYear, selectedMonth, setSelectedYear, setSelectedMonth } = usePeriod();
  const [isUploading, setIsUploading] = useState(false);

  const retPeriod = useMemo(
    () => toRetPeriod(selectedYear.label, selectedMonth),
    [selectedYear, selectedMonth]
  );

  // The "uploaded GSTR-2B data" this page reconciles IS the purchase-register upload —
  // there is no separate GSTR-2B filing. Uploading here calls the same /api/gstr2/upload
  // endpoint as the Purchase Register page, and both pages read the same filing/invoices.
  const [filings, setFilings] = useState<PurchaseRegisterFiling[]>([]);
  const [loadingFilings, setLoadingFilings] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadFilings = useCallback(async () => {
    if (!currentEntity?.id) {
      setFilings([]);
      return;
    }
    setLoadingFilings(true);
    setLoadError(null);
    try {
      setFilings(await purchaseRegisterApi.getFilingsByCompanyGst(currentEntity.id));
    } catch (error) {
      console.error(error);
      setLoadError(describeApiError(error));
      setFilings([]);
    } finally {
      setLoadingFilings(false);
    }
  }, [currentEntity]);

  useEffect(() => {
    loadFilings();
  }, [loadFilings]);

  const filing = useMemo(
    () => filings.find(
      (f) => f.financialYear === selectedYear.label && f.taxPeriod.toUpperCase() === selectedMonth.toUpperCase()
    ) ?? null,
    [filings, selectedYear, selectedMonth]
  );

  const [invoices, setInvoices] = useState<PrB2b[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!filing) {
        setInvoices([]);
        return;
      }
      setLoadingInvoices(true);
      try {
        const rows = await purchaseRegisterApi.getB2b(filing.id);
        if (!cancelled) setInvoices(rows);
      } catch (error) {
        console.error(error);
        if (!cancelled) setInvoices([]);
      } finally {
        if (!cancelled) setLoadingInvoices(false);
      }
    })();
    return () => { cancelled = true; };
  }, [filing]);

  const handleUpload = useCallback(async (file: File, year: string, month: string) => {
    if (!currentEntity?.id) {
      alert('Please select an entity first.');
      return;
    }
    try {
      setIsUploading(true);
      await purchaseRegisterApi.upload(file, currentEntity.id, year, month.toUpperCase());
      alert(`File ${file.name} uploaded successfully!`);
      await loadFilings();
    } catch (error) {
      console.error(error);
      alert('Failed to upload GSTR-2B. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [currentEntity, loadFilings]);

  const handleSync = useCallback(() => {
    alert('GSTR-2B is uploaded from an Excel export, not synced live. Use "Upload new file" instead.');
  }, []);

  const hasStoredGstr2bData = !!filing && invoices.length > 0;
  const loadingExisting = loadingFilings || loadingInvoices;

  const storedGstr2bSummary = useMemo(() => {
    if (!filing) return undefined;
    const count = `${invoices.length} invoice${invoices.length === 1 ? '' : 's'}`;
    const when = filing.createdDate
      ? new Date(filing.createdDate).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
        })
      : null;
    return [count, when ? `Uploaded ${when}` : null, `Status: ${filing.filingStatus}`]
      .filter(Boolean)
      .join(' · ');
  }, [filing, invoices.length]);

  const registrationColDefs = useMemo<ColDef[]>(() => [
    {
      field: 'field_attribute',
      headerName: 'FIELD ATTRIBUTE',
      flex: 1,
      cellRenderer: (params: any) => (
        <div className={styles.fieldLabel}>
          <div className={styles.iconWrapper}>
            {params.data.icon}
          </div>
          {params.value}
        </div>
      )
    },
    { field: 'recorded_value', headerName: 'RECORDED VALUE', flex: 1, cellClass: styles.valueText }
  ], []);

  const registrationRowData = useMemo(() => {
    if (!data) return [];
    return [
      { field_attribute: 'GSTIN', recorded_value: data.registrationDetails.gstin, icon: <IconGSTIN /> },
      { field_attribute: 'LEGAL NAME OF REGISTERED PERSON', recorded_value: data.registrationDetails.legalName, icon: <IconBuilding /> },
      { field_attribute: 'YEAR', recorded_value: data.registrationDetails.year, icon: <IconCalendar /> },
      { field_attribute: 'MONTH', recorded_value: data.registrationDetails.month, icon: <IconCalendar /> },
      { field_attribute: 'LEGAL TRADE NAME', recorded_value: data.registrationDetails.tradeName, icon: <IconStore /> },
      { field_attribute: 'DATE OF GENERATION', recorded_value: data.registrationDetails.generationDate, icon: <IconCalendarCheck /> },
    ];
  }, [data]);

  const itcColDefs = useMemo<ColDef[]>(() => [
    { field: 'section', headerName: 'SECTION', width: 120, cellClass: 'ag-cell-bold' },
    { field: 'heading', headerName: 'HEADING', flex: 1 },
    { 
      field: 'gstr3bTable', 
      headerName: 'GSTR-3B TABLE', 
      width: 150,
      cellClass: (params: any) => params.value !== 'NA' ? 'ag-cell-bold' : '',
      cellStyle: (params: any): any => {
        if (params.value === 'NA') return { color: '#9ca3af', fontWeight: 600 };
        if (params.value && params.value.length > 5) return { fontSize: '12px' };
        return {};
      }
    },
    { field: 'igst', headerName: 'IGST (₹)', width: 130, cellClass: 'ag-cell-right ag-cell-bold', headerClass: 'ag-header-cell-right', valueFormatter: (p: any) => p.value.toLocaleString('en-IN') },
    { field: 'cgst', headerName: 'CGST (₹)', width: 130, cellClass: 'ag-cell-right ag-cell-bold', headerClass: 'ag-header-cell-right', valueFormatter: (p: any) => p.value.toLocaleString('en-IN') },
    { field: 'sgst', headerName: 'SGST (₹)', width: 130, cellClass: 'ag-cell-right ag-cell-bold', headerClass: 'ag-header-cell-right', valueFormatter: (p: any) => p.value.toLocaleString('en-IN') },
    { field: 'cess', headerName: 'CESS (₹)', width: 130, cellClass: 'ag-cell-right ag-cell-bold', headerClass: 'ag-header-cell-right', valueFormatter: (p: any) => p.value.toLocaleString('en-IN') },
  ], []);

  if (isLoading) {
    return <div style={{ padding: '48px', textAlign: 'center' }}>Loading GSTR-2B data...</div>;
  }

  if (isFiled) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successCard}>
          <div className={styles.successIconBox}>
            <IconVerified />
          </div>
          <h2 className={styles.successTitle}>GSTR-2B Has Been Filed Successfully</h2>
          <p className={styles.successSubtitle}>
            You can see the recent filed returns in the
            <br />
            Recent/Filed section of your dashboard.
          </p>
          <button className={styles.successBtn} onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer} style={{ position: 'relative' }}>
      {isUploading && (
        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, background: '#eef2ff', color: '#4f46e5', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold' }}>
          Uploading GSTR-2B...
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div className="global-main-tabs-container" style={{ marginBottom: 0 }}>
          <div className="global-main-tabs-wrapper">
            {MAIN_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`global-main-tab ${activeMainTab === tab ? 'global-main-tab-active' : ''}`}
                onClick={() => setActiveMainTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <PeriodSelector
          year={selectedYear.label}
          month={selectedMonth}
          onYearChange={(yLabel) => {
            const fy = FY_YEARS.find((f) => f.label === yLabel);
            if (fy) setSelectedYear(fy);
          }}
          onMonthChange={setSelectedMonth}
        />
      </div>

      <h1 className={styles.pageTitle} style={{ padding: '0 24px', marginTop: '24px' }}>GSTR 2B Details</h1>

      {activeMainTab === 'Import' && (
        <div style={{ padding: '0 24px 32px' }}>
          <SimpleUploadUI
            title="GSTR-2B"
            subtitle="Upload the GSTR-2B export for this return period, then reconcile it against IMS"
            onUpload={handleUpload}
            onSync={handleSync}
            loadingExistingData={loadingExisting}
            hasExistingData={hasStoredGstr2bData}
            existingSummary={storedGstr2bSummary}
            existingError={loadError}
            existingData={
              <Gstr2bInvoiceList filing={filing} invoices={invoices} loading={false} retPeriod={retPeriod} embedded />
            }
          />
        </div>
      )}

      {activeMainTab === 'Return' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '0 24px 32px' }}>
      {/* ═══════════════════ SECTION: BASIC ═══════════════════ */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Registration Details</h2>
          <p className={styles.cardSubtitle}>Validated GST registration records from the official portal.</p>
          
          <div className="ag-theme-tax-jiffy" style={{ width: '100%' }}>
            <AgGridReact onFirstDataRendered={(params) => { if (params.api) { const ids = params.api.getColumns()?.map((c) => c.getId()) || []; params.api.autoSizeColumns(ids, false); } }} theme="legacy"
              rowData={registrationRowData}
              columnDefs={registrationColDefs}
              domLayout="autoHeight"
            />
          </div>
        </div>
      {/* ═══════════════════ SECTION: ITC AVAILABLE ═══════════════════ */}
          <div className={styles.accordion}>
            <div 
              className={styles.accordionHeader} 
              onClick={() => setIsAccordionAExpanded(!isAccordionAExpanded)}
            >
              <div className={styles.accordionIconBox}>A</div>
              <div className={styles.accordionTitle}>ITC Available - Credit may be claimed</div>
              <div className={`${styles.accordionChevron} ${isAccordionAExpanded ? styles.accordionChevronExpanded : ''}`}>
                <IconChevronDown />
              </div>
            </div>
            
            <AnimatedExpandable isExpanded={isAccordionAExpanded}>
              <div className="ag-theme-tax-jiffy-data" style={{ width: '100%' }}>
                <AgGridReact onFirstDataRendered={(params) => { if (params.api) { const ids = params.api.getColumns()?.map((c) => c.getId()) || []; params.api.autoSizeColumns(ids, false); } }} theme="legacy"
                  rowData={data?.itcAvailable.creditMayBeClaimed || []}
                  columnDefs={itcColDefs}
                  domLayout="autoHeight"
                />
              </div>
            </AnimatedExpandable>
          </div>

          <div className={styles.accordion}>
            <div 
              className={styles.accordionHeader} 
              onClick={() => setIsAccordionBExpanded(!isAccordionBExpanded)}
            >
              <div className={styles.accordionIconBox}>B</div>
              <div className={styles.accordionTitle}>ITC Reversal - Credit shall be reversed</div>
              <div className={`${styles.accordionChevron} ${isAccordionBExpanded ? styles.accordionChevronExpanded : ''}`}>
                <IconChevronDown />
              </div>
            </div>
            
            <AnimatedExpandable isExpanded={isAccordionBExpanded}>
              <div className="ag-theme-tax-jiffy-data" style={{ width: '100%' }}>
                <AgGridReact onFirstDataRendered={(params) => { if (params.api) { const ids = params.api.getColumns()?.map((c) => c.getId()) || []; params.api.autoSizeColumns(ids, false); } }} theme="legacy"
                  rowData={data?.itcAvailable.creditShallBeReversed || []}
                  columnDefs={itcColDefs}
                  domLayout="autoHeight"
                />
              </div>
            </AnimatedExpandable>
          </div>

      {/* ═══════════════════ SECTION: ITC NOT AVAILABLE ═══════════════════ */}
          <div className={styles.accordion}>
            <div 
              className={styles.accordionHeader} 
              onClick={() => setIsUnavailableAExpanded(!isUnavailableAExpanded)}
            >
              <div className={styles.accordionIconBox}>A</div>
              <div className={styles.accordionTitle}>ITC Not Available</div>
              <div className={`${styles.accordionChevron} ${isUnavailableAExpanded ? styles.accordionChevronExpanded : ''}`}>
                <IconChevronDown />
              </div>
            </div>
            
            <AnimatedExpandable isExpanded={isUnavailableAExpanded}>
              <div className="ag-theme-tax-jiffy-data" style={{ width: '100%' }}>
                <AgGridReact onFirstDataRendered={(params) => { if (params.api) { const ids = params.api.getColumns()?.map((c) => c.getId()) || []; params.api.autoSizeColumns(ids, false); } }} theme="legacy"
                  rowData={data?.itcUnavailable.itcNotAvailable || []}
                  columnDefs={itcColDefs}
                  domLayout="autoHeight"
                />
              </div>
            </AnimatedExpandable>
          </div>

          <div className={styles.accordion}>
            <div 
              className={styles.accordionHeader} 
              onClick={() => setIsUnavailableBExpanded(!isUnavailableBExpanded)}
            >
              <div className={styles.accordionIconBox}>B</div>
              <div className={styles.accordionTitle}>ITC Reversal</div>
              <div className={`${styles.accordionChevron} ${isUnavailableBExpanded ? styles.accordionChevronExpanded : ''}`}>
                <IconChevronDown />
              </div>
            </div>
            
            <AnimatedExpandable isExpanded={isUnavailableBExpanded}>
              <div className="ag-theme-tax-jiffy-data" style={{ width: '100%' }}>
                <AgGridReact onFirstDataRendered={(params) => { if (params.api) { const ids = params.api.getColumns()?.map((c) => c.getId()) || []; params.api.autoSizeColumns(ids, false); } }} theme="legacy"
                  rowData={data?.itcUnavailable.itcReversal || []}
                  columnDefs={itcColDefs}
                  domLayout="autoHeight"
                />
              </div>
            </AnimatedExpandable>
          </div>

          <div className={styles.confirmContainer}>
            <button className={styles.confirmBtn} onClick={() => setIsFiled(true)}>Confirm Filing</button>
          </div>
        </div>
      )}

      {activeMainTab === '2B-Reco' && (
        <div style={{ padding: '0 24px 32px' }}>
          {!filing ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              Upload GSTR-2B for {retPeriod} on the Import tab to start reconciling it against IMS.
            </div>
          ) : (
            <Gstr2bReconciliationPanel filingId={filing.id} filingStatus={filing.filingStatus} retPeriod={retPeriod} />
          )}
        </div>
      )}
    </div>
  );
}
