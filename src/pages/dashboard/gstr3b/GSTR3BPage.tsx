import { useState, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ColGroupDef } from 'ag-grid-community';
import styles from './GSTR3BPage.module.css';
import {
  useCreateOrLinkGstr3b,
  useGstr3bFiling,
  useGstr3bPreview,
  useSyncIms,
  useSync2b,
  useUpdateInterestLateFee,
  useGenerateChallan,
  useSubmitFiling,
} from './hooks/useGstr3bFiling';
import { usePurchaseRegisterFilings } from '@/pages/dashboard/purchaseRegister/hooks/usePurchaseRegisterSheets';
import * as XLSX from 'xlsx';
import { useCurrentEntity } from '@/hooks/useCurrentEntity';
import { usePeriod, FY_YEARS } from '@/context/PeriodContext';
import { PeriodSelector } from '@/components/PeriodSelector/PeriodSelector';
import { AnimatedExpandable } from '@/components/AnimatedExpandable/AnimatedExpandable';
import type {
  Gstr3bFiling,
  ImsCredentials,
  TwoBCredentials,
  Gstr3bInterestLateFeeRequest,
} from './api/gstr3bApi';


// ── Helpers ───────────────────────────────────────────────────────────────
function fmt(v: number | null | undefined): string {
  if (v == null) return '—';
  return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
}

function SyncStatusBadge({ status, at }: { status: string | null; at: string | null }) {
  if (!status) return <span className={styles.syncBadgeNone}>Not Synced</span>;
  const isOk = status === 'SYNCED';
  return (
    <span className={isOk ? styles.syncBadgeOk : styles.syncBadgeError}>
      {isOk ? '✓' : '✕'} {status} {at ? `· ${new Date(at).toLocaleDateString('en-IN')}` : ''}
    </span>
  );
}

// ── Dynamic Grid ────────────────────────────────────────────────────────
const DynamicAgGrid = (props: any) => {
  const [cw, setCw] = useState<string>('100%');
  const updateWidth = useCallback((params: any) => {
    requestAnimationFrame(() => {
      if (!params.api) return;
      const colState: any[] = params.api.getColumnState?.() ?? [];
      const total = colState
        .filter((c: any) => !c.hide)
        .reduce((sum: number, c: any) => sum + (c.width ?? 0), 0);
      if (total > 0) setCw(`${total + 2}px`);
    });
  }, []);
  
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <div className={props.wrapperClassName} style={{ width: cw, maxWidth: '100%', marginBottom: props.marginBottom || 0 }}>
        <AgGridReact
          {...props}
          headerHeight={48}
          groupHeaderHeight={48}
          floatingFiltersHeight={48}
          autoSizeStrategy={{ type: 'fitCellContents' }}
          onGridReady={updateWidth}
          onFirstDataRendered={(params: any) => {
            if (params.api) {
              const allColIds = params.api.getColumns()?.map((col: any) => col.getId()) || [];
              params.api.autoSizeColumns(allColIds, false);
            }
            updateWidth(params);
          }}
          onColumnResized={updateWidth}
        />
      </div>
    </div>
  );
};

// ── Credential Modal ──────────────────────────────────────────────────────
function ImsCredentialModal({
  gstin,
  onClose,
  onSubmit,
  isLoading,
}: {
  gstin: string;
  onClose: () => void;
  onSubmit: (creds: ImsCredentials) => void;
  isLoading: boolean;
}) {
  const [creds, setCreds] = useState<ImsCredentials>({
    gstin, email: '', retperiod: '', section: 'B2B', rtnTyp: 'GSTR2B',
    gstUsername: '', stateCd: '', ipAddress: '', txn: '', clientId: '', clientSecret: '',
  });
  const set = (k: keyof ImsCredentials) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCreds((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>IMS Sync Credentials</h3>
          <button type="button" className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.modalGrid}>
            {(
              [
                ['gstin',       'GSTIN',         'text'],
                ['email',       'Email',         'email'],
                ['retperiod',   'Return Period (MMYYYY)', 'text'],
                ['section',     'Section',       'text'],
                ['rtnTyp',      'Return Type',   'text'],
                ['gstUsername', 'GST Username',  'text'],
                ['stateCd',     'State Code',    'text'],
                ['ipAddress',   'IP Address',    'text'],
                ['txn',         'TXN',           'text'],
                ['clientId',    'Client ID',     'text'],
                ['clientSecret','Client Secret', 'password'],
              ] as [keyof ImsCredentials, string, string][]
            ).map(([key, label, type]) => (
              <div key={key} className={styles.formField}>
                <label className={styles.formLabel}>{label}</label>
                <input
                  type={type}
                  className={styles.formInput}
                  value={creds[key]}
                  onChange={set(key)}
                  placeholder={label}
                />
              </div>
            ))}
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button type="button" className={styles.modalCancelBtn} onClick={onClose}>Cancel</button>
          <button
            type="button"
            className={styles.modalSubmitBtn}
            onClick={() => onSubmit(creds)}
            disabled={isLoading}
          >
            {isLoading ? 'Syncing…' : 'Sync IMS Data'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TwoBCredentialModal({
  gstin,
  onClose,
  onSubmit,
  isLoading,
}: {
  gstin: string;
  onClose: () => void;
  onSubmit: (creds: TwoBCredentials) => void;
  isLoading: boolean;
}) {
  const [creds, setCreds] = useState<TwoBCredentials>({
    gstin, rtnprd: '', filenum: '', email: '',
    gstUsername: '', stateCd: '', ipAddress: '', txn: '', clientId: '', clientSecret: '',
  });
  const set = (k: keyof TwoBCredentials) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCreds((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>GSTR-2B Sync Credentials</h3>
          <button type="button" className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.modalGrid}>
            {(
              [
                ['gstin',       'GSTIN',               'text'],
                ['rtnprd',      'Return Period',        'text'],
                ['filenum',     'File Number',          'text'],
                ['email',       'Email',                'email'],
                ['gstUsername', 'GST Username',         'text'],
                ['stateCd',     'State Code',           'text'],
                ['ipAddress',   'IP Address',           'text'],
                ['txn',         'TXN',                  'text'],
                ['clientId',    'Client ID',            'text'],
                ['clientSecret','Client Secret',        'password'],
              ] as [keyof TwoBCredentials, string, string][]
            ).map(([key, label, type]) => (
              <div key={key} className={styles.formField}>
                <label className={styles.formLabel}>{label}</label>
                <input
                  type={type}
                  className={styles.formInput}
                  value={creds[key]}
                  onChange={set(key)}
                  placeholder={label}
                />
              </div>
            ))}
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button type="button" className={styles.modalCancelBtn} onClick={onClose}>Cancel</button>
          <button
            type="button"
            className={styles.modalSubmitBtn}
            onClick={() => onSubmit(creds)}
            disabled={isLoading}
          >
            {isLoading ? 'Syncing…' : 'Sync GSTR-2B Data'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export function GSTR3BPage() {
  const MAIN_TABS = ['Summary', '3B-Reco', 'Return'] as const;
  type MainTab = typeof MAIN_TABS[number];
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('Summary');
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
  const [isFiled, setIsFiled] = useState(false);
  const [showImsModal, setShowImsModal] = useState(false);
  const [show2bModal, setShow2bModal] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  // The purchase register filing ID to link into this GSTR-3B filing
  const [selectedPrFilingId, setSelectedPrFilingId] = useState<number | null>(null);

  const { selectedYear, selectedMonth, setSelectedYear, setSelectedMonth } = usePeriod();
  const { data: currentEntity } = useCurrentEntity();

  const companyGstId = currentEntity?.id ?? null;
  const gstin = currentEntity?.gstin ?? '';

  const { filings } = useGstr3bFiling(companyGstId && companyGstId !== 0 ? companyGstId : null);
  const { filing, setFiling, createOrLink, isLoading: isCreating, error: createError } = useCreateOrLinkGstr3b();
  const preview = useGstr3bPreview(filing?.id ?? null);
  const imsSync = useSyncIms();
  const twoBSync = useSync2b();
  const interestMutation = useUpdateInterestLateFee();
  const generateChallan = useGenerateChallan();
  const submitFiling = useSubmitFiling();

  // Purchase Register filings available to link
  const { data: prFilings = [] } = usePurchaseRegisterFilings(
    companyGstId && companyGstId !== 0 ? companyGstId : null,
  );

  const [interestForm, setInterestForm] = useState<Gstr3bInterestLateFeeRequest>({
    interestIntegratedTax: 0,
    interestCentralTax: 0,
    interestStateUtTax: 0,
    interestCess: 0,
    lateFeeCentralTax: 0,
    lateFeeStateUtTax: 0,
  });

  const toggleAccordion = (id: string) =>
    setExpandedAccordion((prev) => (prev === id ? null : id));

  const handleCreateFiling = useCallback(async () => {
    if (!companyGstId || companyGstId === 0) return;
    setSyncMessage(null);
    const result = await createOrLink({
      companyGstId,
      financialYear: selectedYear.label,
      taxPeriod: selectedMonth.toUpperCase(),
      // Link the chosen purchase register filing (gstr2 filing)
      ...(selectedPrFilingId ? { gstr2FilingId: selectedPrFilingId } : {}),
    });
    if (result) setSyncMessage(`Filing #${result.id} ready for ${selectedYear.label} – ${selectedMonth}${selectedPrFilingId ? ` · PR Filing #${selectedPrFilingId} linked` : ''}`);
  }, [companyGstId, selectedYear, selectedMonth, selectedPrFilingId, createOrLink]);

  const handleImsSubmit = useCallback(
    async (creds: ImsCredentials) => {
      if (!filing) return;
      const res = await imsSync.sync(filing.id, creds);
      if (res) {
        setShowImsModal(false);
        setSyncMessage(`IMS sync complete — ${res.rowsSynced} rows imported.`);
        setFiling({ ...filing, imsSyncStatus: 'SYNCED', imsSyncedAt: new Date().toISOString() });
      }
    },
    [filing, imsSync, setFiling],
  );

  const handle2bSubmit = useCallback(
    async (creds: TwoBCredentials) => {
      if (!filing) return;
      const res = await twoBSync.sync(filing.id, creds);
      if (res) {
        setShow2bModal(false);
        setSyncMessage(`GSTR-2B sync complete — ${res.rowsSynced} ITC rows imported.`);
        setFiling({ ...filing, twoBSyncStatus: 'SYNCED', twoBSyncedAt: new Date().toISOString() });
      }
    },
    [filing, twoBSync, setFiling],
  );

  const handleSaveInterest = useCallback(async () => {
    if (!filing) return;
    await interestMutation.mutateAsync({ filingId: filing.id, req: interestForm });
    setSyncMessage('Interest & late fee saved successfully.');
  }, [filing, interestForm, interestMutation]);

  // ── Preview data helpers ─────────────────────────────────────────────────
  const p = preview.data?.gstr3b;

  // Flatten table 4 sections into flat rows for AG Grid
  const table4Rows = useMemo(() => {
    if (!p?.table_4_eligible_itc) return [];
    const rows: any[] = [];
    for (const section of p.table_4_eligible_itc.sections) {
      rows.push({ detail: section.title, isSectionHeader: true });
      for (const row of section.rows) rows.push(row);
    }
    return rows;
  }, [p]);

  // Flatten table 3.2 sections
  const table32Rows = useMemo(() => {
    if (!p?.table_3_2_interstate_supplies) return [];
    const rows: any[] = [];
    for (const section of p.table_3_2_interstate_supplies.sections) {
      rows.push({ place_of_supply: section.title, isSectionHeader: true });
      for (const row of section.rows) rows.push(row);
    }
    return rows;
  }, [p]);

  const handleExportExcel = useCallback(() => {
    if (!p) return;
    const wb = XLSX.utils.book_new();

    const appendSheet = (title: string, data: any[]) => {
      if (data && data.length > 0) {
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31));
      }
    };

    appendSheet('3.1 Outward', p.table_3_1_outward_and_reverse_charge_inward_supplies?.rows ?? []);
    appendSheet('3.2 Interstate', table32Rows);
    appendSheet('4 Eligible ITC', table4Rows);
    appendSheet('5 Exempt Inward', p.table_5_exempt_nil_nongst_inward_supplies?.rows ?? []);
    appendSheet('5.1 Interest & Late Fee', p.table_5_1_interest_and_late_fee?.rows ?? []);
    appendSheet('6.1 Payment', p.table_6_1_payment_of_tax?.rows ?? []);

    XLSX.writeFile(wb, `GSTR3B_Draft_${selectedMonth}_${selectedYear.label}.xlsx`);
  }, [p, table32Rows, table4Rows, selectedMonth, selectedYear]);

  const handlePrintPDF = useCallback(() => {
    window.print();
  }, []);

  const handleGenerateChallan = useCallback(async () => {
    if (!filing) return;
    try {
      const result = await generateChallan.mutateAsync(filing.id);
      setSyncMessage('Challan generated successfully!');
      setFiling(prev => prev ? { ...prev, challanUrl: result.challanUrl } : prev);
      if (result.challanUrl) window.open(result.challanUrl, '_blank');
    } catch (e: any) {
      setSyncMessage(`Error generating challan: ${e.message}`);
    }
  }, [filing, generateChallan, setFiling]);

  const handleConfirmFiling = useCallback(async () => {
    if (!filing) return;
    try {
      const result = await submitFiling.mutateAsync(filing.id);
      setIsFiled(true);
      setFiling(prev => prev ? { ...prev, filingStatus: 'FILED', acknowledgmentUrl: result.acknowledgmentUrl, reportUrl: result.reportUrl } : prev);
    } catch (e: any) {
      setSyncMessage(`Error submitting return: ${e.message}`);
    }
  }, [filing, submitFiling, setFiling]);

  // ── ColDefs ──────────────────────────────────────────────────────────────
  const defaultColDef = useMemo<ColDef>(
    () => ({ resizable: true, suppressSizeToFit: true }),
    []
  );

  const R = { cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right' } as const;
  const L = { cellClass: 'ag-cell-left',  headerClass: 'ag-header-cell-left'  } as const;

  const colDefs31 = useMemo<(ColDef | ColGroupDef)[]>(() => [
    { field: 'nature_of_supply', headerName: 'Nature of Supplies', minWidth: 200, ...L },
    { field: 'taxable_value',    headerName: 'Taxable Value (₹)',  minWidth: 120, ...R },
    { headerName: 'Amount (₹)', children: [
      { field: 'integrated_tax', headerName: 'IGST', minWidth: 100, ...R },
      { field: 'central_tax',    headerName: 'CGST', minWidth: 100, ...R },
      { field: 'state_ut_tax',   headerName: 'SGST', minWidth: 100, ...R },
      { field: 'cess',           headerName: 'CESS', minWidth: 100, ...R },
    ]},
  ], []);

  const colDefs32 = useMemo<ColDef[]>(() => [
    { field: 'place_of_supply', headerName: 'Place of Supply', minWidth: 200, ...L },
    { field: 'taxable_value',   headerName: 'Taxable Value (₹)', minWidth: 120, ...R },
    { field: 'integrated_tax',  headerName: 'IGST (₹)', minWidth: 120, ...R },
  ], []);

  const colDefs4 = useMemo<ColDef[]>(() => [
    { field: 'detail',        headerName: 'Details', minWidth: 200, ...L },
    { field: 'integrated_tax',headerName: 'IGST (₹)', minWidth: 100, ...R },
    { field: 'central_tax',   headerName: 'CGST (₹)', minWidth: 100, ...R },
    { field: 'state_ut_tax',  headerName: 'SGST (₹)', minWidth: 100, ...R },
    { field: 'cess',          headerName: 'CESS (₹)', minWidth: 100, ...R },
  ], []);

  const colDefs5 = useMemo<ColDef[]>(() => [
    { field: 'nature_of_supply',      headerName: 'Nature of Supply',  minWidth: 200, ...L },
    { field: 'inter_state_supplies',  headerName: 'Inter-State (₹)',   minWidth: 120, ...R },
    { field: 'intra_state_supplies',  headerName: 'Intra-State (₹)',   minWidth: 120, ...R },
  ], []);

  const colDefs51 = useMemo<ColDef[]>(() => [
    { field: 'description',   headerName: 'Description', minWidth: 200, ...L },
    { field: 'integrated_tax',headerName: 'IGST (₹)', minWidth: 100, ...R },
    { field: 'central_tax',   headerName: 'CGST (₹)', minWidth: 100, ...R },
    { field: 'state_ut_tax',  headerName: 'SGST (₹)', minWidth: 100, ...R },
    { field: 'cess',          headerName: 'CESS (₹)', minWidth: 100, ...R },
  ], []);

  const colDefs61 = useMemo<(ColDef | ColGroupDef)[]>(() => [
    { field: 'description',     headerName: 'Description', minWidth: 150, ...L },
    { field: 'tax_payable',     headerName: 'Tax Payable', minWidth: 120,   ...R },
    { headerName: 'Paid through ITC', children: [
      { field: 'paid_itc_integrated', headerName: 'IGST', minWidth: 100, ...R },
      { field: 'paid_itc_central',    headerName: 'CGST', minWidth: 100, ...R },
      { field: 'paid_itc_state_ut',   headerName: 'SGST', minWidth: 100, ...R },
      { field: 'paid_itc_cess',       headerName: 'CESS', minWidth: 100, ...R },
    ]},
    { field: 'tax_paid_cash',       headerName: 'Cash', minWidth: 100,   ...R },
    { field: 'interest_paid_cash',  headerName: 'Interest', minWidth: 100, ...R },
    { field: 'late_fee_paid_cash',  headerName: 'Late Fee', minWidth: 100, ...R },
  ], []);

  const rowClassRules = useMemo(() => ({
    'ag-row-section-header': (p: any) => p.data?.isSectionHeader === true,
    'ag-row-total': (p: any) => p.data?.isTotal === true,
  }), []);


  // ── Success screen ────────────────────────────────────────────────────────
  if (isFiled) {
    return (
      <div className={styles.page}>
        <div className={styles.successScreen}>
          <div className={styles.successCard}>
            <div className={styles.successIconWrapper}>
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="40" fill="#5a6acf" />
                <path d="M24 40l12 12 20-24" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className={styles.successTitle}>GSTR-3B Has Been Filed<br />Successfully</h2>
            <p className={styles.successSubtitle}>Filing #{filing?.id} for {selectedYear.label} – {selectedMonth} is complete.</p>
            <button type="button" className={styles.successBtn} onClick={() => setIsFiled(false)}>
              Back to GSTR-3B
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="global-main-tabs-container">
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

      {activeMainTab === 'Summary' && (
        <>
          {/* ── Page Header ── */}
          <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>GSTR-3B</h1>
        <p className={styles.pageSubtitle}>
          Reconcile outward supplies, ITC, and payment of tax before filing your monthly GSTR-3B return.
        </p>
      </div>

      {/* ── Filing Selector ── */}
      <div className={styles.filingSelector}>
        <div className={styles.filingSelectorLeft}>
          <div className={styles.filingSelectorGroup}>
            <span className={styles.filingSelectorLabel}>Filing Period</span>
            <PeriodSelector
              year={selectedYear.label}
              month={selectedMonth}
              onYearChange={(yLabel) => { const fy = FY_YEARS.find((f) => f.label === yLabel); if (fy) setSelectedYear(fy); }}
              onMonthChange={setSelectedMonth}
            />
          </div>

          {/* Purchase Register filing selector */}
          <div className={styles.filingSelectorGroup}>
            <span className={styles.filingSelectorLabel}>
              Link Purchase Register
            </span>
            {prFilings.length === 0 ? (
              <span className={styles.prNoFilings}>
                No filings uploaded yet —{' '}
                <a href="/dashboard/purchase-register" className={styles.prUploadLink}>
                  Upload now
                </a>
              </span>
            ) : (
              <select
                className={styles.prFilingSelect}
                value={selectedPrFilingId ?? ''}
                onChange={(e) =>
                  setSelectedPrFilingId(e.target.value ? Number(e.target.value) : null)
                }
              >
                <option value="">— Select PR Filing —</option>
                {prFilings.map((f) => (
                  <option key={f.id} value={f.id}>
                    #{f.id} · {f.taxPeriod} {f.financialYear} · {f.originalFileName}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {filing && p && (
            <>
              <button type="button" className={styles.syncBtn} onClick={handleExportExcel}>
                Export Excel
              </button>
              <button type="button" className={styles.syncBtn} onClick={handlePrintPDF}>
                Print PDF
              </button>
            </>
          )}
          <button
            type="button"
            className={styles.createFilingBtn}
            onClick={handleCreateFiling}
            disabled={isCreating || !companyGstId || companyGstId === 0}
          >
            {isCreating ? 'Creating…' : filing ? `Filing #${filing.id} ✓` : 'Create / Load Filing'}
          </button>
        </div>
      </div>

      {/* ── Error / info banner ── */}
      {createError && <div className={styles.errorBanner}><span>⚠</span> {createError}</div>}
      {syncMessage && <div className={styles.infoBanner}><span>ℹ</span> {syncMessage}</div>}

      {/* ── Sync Panel (shown once filing exists) ── */}
      {filing && (
        <div className={styles.syncPanel}>
          <div className={styles.syncItem}>
            <div className={styles.syncItemInfo}>
              <span className={styles.syncItemTitle}>IMS Invoices</span>
              <SyncStatusBadge status={filing.imsSyncStatus} at={filing.imsSyncedAt} />
            </div>
            <button type="button" className={styles.syncBtn} onClick={() => setShowImsModal(true)}>
              Sync IMS →
            </button>
          </div>
          <div className={styles.syncDivider} />
          <div className={styles.syncItem}>
            <div className={styles.syncItemInfo}>
              <span className={styles.syncItemTitle}>GSTR-2B (ITC Summary)</span>
              <SyncStatusBadge status={filing.twoBSyncStatus} at={filing.twoBSyncedAt} />
            </div>
            <button type="button" className={styles.syncBtn} onClick={() => setShow2bModal(true)}>
              Sync GSTR-2B →
            </button>
          </div>
        </div>
      )}
        </>
      )}

      {activeMainTab === 'Return' && (
        <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '24px', paddingBottom: '32px' }}>
      {/* ═══════════════════ SECTION: BASIC ═══════════════════ */}
        <div className={styles.registrationCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className={styles.cardTitle}>Filing Details</h2>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Legal Name</span>
              <p className={styles.detailValue}>{currentEntity?.companyName || '—'}</p>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>GST Identification Number</span>
              <p className={`${styles.detailValue} ${styles.gstinValue}`}>
                {currentEntity?.gstin || '—'}
                {currentEntity?.gstin && currentEntity.gstin !== 'N/A' && (
                  <svg className={styles.copyIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" onClick={() => navigator.clipboard.writeText(currentEntity.gstin)}>
                    <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </p>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Tax Period</span>
              <p className={styles.detailValue}>{selectedMonth} {selectedYear.label}</p>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Filing Status</span>
              <div>
                <span className={styles.statusBadge}>
                  <span className={styles.statusDot} />
                  {filing?.filingStatus || 'No Filing Created'}
                </span>
              </div>
            </div>
            {filing && (
              <>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Filing ID</span>
                  <p className={styles.detailValue}>#{filing.id}</p>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>IMS Sync</span>
                  <p className={styles.detailValue}><SyncStatusBadge status={filing.imsSyncStatus} at={filing.imsSyncedAt} /></p>
                </div>
              </>
            )}
          </div>

          {/* Previous Filings */}
          {filings.length > 0 && (
            <div className={styles.prevFilingsSection}>
              <h3 className={styles.prevFilingsTitle}>Previous Filings</h3>
              <div className={styles.prevFilingsGrid}>
                {filings.map((f: Gstr3bFiling) => (
                  <div
                    key={f.id}
                    className={`${styles.prevFilingCard} ${filing?.id === f.id ? styles.prevFilingCardActive : ''}`}
                    onClick={() => setFiling(f)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') setFiling(f); }}
                  >
                    <span className={styles.prevFilingPeriod}>{f.taxPeriod} {f.financialYear}</span>
                    <span className={`${styles.prevFilingStatus} ${f.filingStatus === 'DRAFT' ? styles.prevFilingStatusDraft : styles.prevFilingStatusFiled}`}>
                      {f.filingStatus}
                    </span>
                    {(f.acknowledgmentUrl || f.reportUrl) && (
                      <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                        {f.acknowledgmentUrl && (
                          <a href={f.acknowledgmentUrl} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#5A6ACF', textDecoration: 'underline' }} onClick={(e) => e.stopPropagation()}>ACK</a>
                        )}
                        {f.reportUrl && (
                          <a href={f.reportUrl} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#5A6ACF', textDecoration: 'underline' }} onClick={(e) => e.stopPropagation()}>Report</a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      {/* ═══════════════════ SECTION: OUTWARD ═══════════════════ */}
        <div className={styles.outwardContainer}>
          {!filing ? (
            <div className={styles.noFilingMsg}>Create or load a filing first to see preview data.</div>
          ) : preview.isLoading ? (
            <div className={styles.loadingMsg}><div className={styles.spinner} /> Loading preview…</div>
          ) : (
            <>
              {/* Accordion 3.1 */}
              <div className={styles.accordion}>
                <div className={styles.accordionHeader} onClick={() => toggleAccordion('3.1')}>
                  <div className={styles.accordionNumber}>3.1</div>
                  <h3 className={styles.accordionTitle}>Details of Outward Supplies and inward supplies liable to reverse charge</h3>
                  <div className={`${styles.accordionIcon} ${expandedAccordion === '3.1' ? styles.accordionIconExpanded : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                </div>
                <AnimatedExpandable isExpanded={expandedAccordion === '3.1'}>
                  <div className={styles.accordionContent}>
                    <DynamicAgGrid wrapperClassName={`${styles.gstr3bGrid} ag-theme-tax-jiffy ag-theme-blue-headers ag-theme-blue-group-headers`} theme="legacy" rowData={p?.table_3_1_outward_and_reverse_charge_inward_supplies?.rows ?? []} columnDefs={colDefs31} defaultColDef={defaultColDef} domLayout="autoHeight" suppressMenuHide />
                    {p?.table_3_1_outward_and_reverse_charge_inward_supplies?.total && (
                      <div className={styles.totalRow}>
                        <span>Total:</span>
                        <span>Taxable: ₹{fmt(p.table_3_1_outward_and_reverse_charge_inward_supplies.total.taxable_value)}</span>
                        <span>IGST: ₹{fmt(p.table_3_1_outward_and_reverse_charge_inward_supplies.total.integrated_tax)}</span>
                        <span>CGST: ₹{fmt(p.table_3_1_outward_and_reverse_charge_inward_supplies.total.central_tax)}</span>
                        <span>SGST: ₹{fmt(p.table_3_1_outward_and_reverse_charge_inward_supplies.total.state_ut_tax)}</span>
                      </div>
                    )}
                  </div>
                </AnimatedExpandable>
              </div>

              {/* Accordion 3.2 */}
              <div className={styles.accordion}>
                <div className={styles.accordionHeader} onClick={() => toggleAccordion('3.2')}>
                  <div className={styles.accordionNumber}>3.2</div>
                  <h3 className={styles.accordionTitle}>Of the supplies shown in 3.1(a) above, details of inter-State supplies made to unregistered persons, composition taxable persons and UIN holders</h3>
                  <div className={`${styles.accordionIcon} ${expandedAccordion === '3.2' ? styles.accordionIconExpanded : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                </div>
                <AnimatedExpandable isExpanded={expandedAccordion === '3.2'}>
                  <div className={styles.accordionContent}>
                    <DynamicAgGrid wrapperClassName={`${styles.gstr3bGrid} ag-theme-tax-jiffy ag-theme-blue-headers`} theme="legacy" rowData={table32Rows} columnDefs={colDefs32} defaultColDef={defaultColDef} rowClassRules={rowClassRules} domLayout="autoHeight" suppressMenuHide />
                  </div>
                </AnimatedExpandable>
              </div>
            </>
          )}
        </div>

      {/* ═══════════════════ SECTION: INWARD ═══════════════════ */}
        <div className={styles.outwardContainer}>
          {!filing ? (
            <div className={styles.noFilingMsg}>Create or load a filing first to see preview data.</div>
          ) : preview.isLoading ? (
            <div className={styles.loadingMsg}><div className={styles.spinner} /> Loading preview…</div>
          ) : (
            <>
              {/* Accordion 4 */}
              <div className={styles.accordion}>
                <div className={styles.accordionHeader} onClick={() => toggleAccordion('table4')}>
                  <div className={styles.accordionNumber}>4</div>
                  <h3 className={styles.accordionTitle}>Eligible ITC</h3>
                  <div className={`${styles.accordionIcon} ${expandedAccordion === 'table4' ? styles.accordionIconExpanded : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                </div>
                <AnimatedExpandable isExpanded={expandedAccordion === 'table4'}>
                  <div className={styles.accordionContent}>
                    <DynamicAgGrid wrapperClassName={`${styles.gstr3bGrid} ag-theme-tax-jiffy ag-theme-blue-headers`} theme="legacy" rowData={table4Rows} columnDefs={colDefs4} defaultColDef={defaultColDef} rowClassRules={rowClassRules} domLayout="autoHeight" suppressMenuHide />
                  </div>
                </AnimatedExpandable>
              </div>

              {/* Accordion 5 */}
              <div className={styles.accordion}>
                <div className={styles.accordionHeader} onClick={() => toggleAccordion('table5')}>
                  <div className={styles.accordionNumber}>5</div>
                  <h3 className={styles.accordionTitle}>Values of exempt, nil-rated and non-GST inward supplies</h3>
                  <div className={`${styles.accordionIcon} ${expandedAccordion === 'table5' ? styles.accordionIconExpanded : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                </div>
                <AnimatedExpandable isExpanded={expandedAccordion === 'table5'}>
                  <div className={styles.accordionContent}>
                    <DynamicAgGrid wrapperClassName={`${styles.gstr3bGrid} ag-theme-tax-jiffy ag-theme-blue-headers`} theme="legacy" rowData={p?.table_5_exempt_nil_nongst_inward_supplies?.rows ?? []} columnDefs={colDefs5} defaultColDef={defaultColDef} domLayout="autoHeight" suppressMenuHide />
                  </div>
                </AnimatedExpandable>
              </div>

              {/* Interest & Late Fee (5.1) */}
              <div className={styles.accordion}>
                <div className={styles.accordionHeader} onClick={() => toggleAccordion('table5_1')}>
                  <div className={styles.accordionNumber}>5.1</div>
                  <h3 className={styles.accordionTitle}>Interest and Late Fee for previous tax period</h3>
                  <div className={`${styles.accordionIcon} ${expandedAccordion === 'table5_1' ? styles.accordionIconExpanded : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                </div>
                <AnimatedExpandable isExpanded={expandedAccordion === 'table5_1'}>
                  <div className={styles.accordionContent}>
                    {/* Preview table */}
                      <DynamicAgGrid wrapperClassName={`${styles.gstr3bGrid} ag-theme-tax-jiffy ag-theme-blue-headers`} marginBottom={24} theme="legacy" rowData={p?.table_5_1_interest_and_late_fee?.rows ?? []} columnDefs={colDefs51} defaultColDef={defaultColDef} domLayout="autoHeight" suppressMenuHide />
                    {/* Manual entry form */}
                    <div className={styles.interestForm}>
                      <h4 className={styles.interestFormTitle}>Manual Entry — Interest & Late Fee</h4>
                      <div className={styles.interestGrid}>
                        {(
                          [
                            ['interestIntegratedTax', 'Interest – IGST'],
                            ['interestCentralTax',     'Interest – CGST'],
                            ['interestStateUtTax',     'Interest – SGST'],
                            ['interestCess',           'Interest – CESS'],
                            ['lateFeeCentralTax',      'Late Fee – CGST'],
                            ['lateFeeStateUtTax',      'Late Fee – SGST'],
                          ] as [keyof Gstr3bInterestLateFeeRequest, string][]
                        ).map(([key, label]) => (
                          <div key={key} className={styles.formField}>
                            <label className={styles.formLabel}>{label}</label>
                            <input
                              type="number"
                              className={styles.formInput}
                              value={interestForm[key] ?? 0}
                              onChange={(e) => setInterestForm((p) => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        className={styles.saveInterestBtn}
                        onClick={handleSaveInterest}
                        disabled={interestMutation.isPending}
                      >
                        {interestMutation.isPending ? 'Saving…' : 'Save Interest & Late Fee'}
                      </button>
                    </div>
                  </div>
                </AnimatedExpandable>
              </div>
            </>
          )}
        </div>

      {/* ═══════════════════ SECTION: PAYMENT OF TAX ═══════════════════ */}
        <div className={styles.outwardContainer}>
          {!filing ? (
            <div className={styles.noFilingMsg}>Create or load a filing first to see preview data.</div>
          ) : preview.isLoading ? (
            <div className={styles.loadingMsg}><div className={styles.spinner} /> Loading preview…</div>
          ) : (
            <div className={styles.accordion}>
              <div className={styles.accordionHeader} onClick={() => toggleAccordion('6.1')}>
                <div className={styles.accordionNumber}>6.1</div>
                <h3 className={styles.accordionTitle}>Payment of Tax</h3>
                <div className={`${styles.accordionIcon} ${expandedAccordion === '6.1' ? styles.accordionIconExpanded : ''}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </div>
              {expandedAccordion === '6.1' && (
                <div className={styles.accordionContent}>
                  <DynamicAgGrid wrapperClassName={`${styles.gstr3bGrid} ag-theme-tax-jiffy ag-theme-blue-headers ag-theme-blue-group-headers ag-theme-spreadsheet-borders`} theme="legacy" rowData={p?.table_6_1_payment_of_tax?.rows ?? []} columnDefs={colDefs61} defaultColDef={defaultColDef} domLayout="autoHeight" suppressMenuHide />
                  {(() => {
                    const totalCashPayable = p?.table_6_1_payment_of_tax?.rows?.reduce((acc: number, row: any) => 
                      acc + (row.tax_paid_cash || 0) + (row.interest_paid_cash || 0) + (row.late_fee_paid_cash || 0), 0) || 0;
                    
                    if (totalCashPayable > 0 && filing?.filingStatus !== 'FILED') {
                      return (
                        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', padding: 16, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                          <div>
                            <span style={{ display: 'block', fontWeight: 600, color: '#1E293B' }}>Challan Required</span>
                            <span style={{ fontSize: 14, color: '#64748B' }}>Total payable in cash: ₹{fmt(totalCashPayable)}</span>
                          </div>
                          <button
                            type="button"
                            className={styles.syncBtn}
                            onClick={handleGenerateChallan}
                            disabled={generateChallan.isPending}
                          >
                            {generateChallan.isPending ? 'Generating…' : filing.challanUrl ? 'Regenerate Challan' : 'Generate Challan'}
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
        </>
      )}

      {/* ── Footer ── */}
      {filing && filing.filingStatus !== 'FILED' && (
        <div className={styles.footer}>
          <button 
            type="button" 
            className={styles.confirmBtn} 
            onClick={handleConfirmFiling}
            disabled={submitFiling.isPending}
          >
            {submitFiling.isPending ? 'Submitting…' : 'Confirm Filing'}
            {!submitFiling.isPending && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* ── Modals ── */}
      {showImsModal && (
        <ImsCredentialModal
          gstin={gstin}
          onClose={() => setShowImsModal(false)}
          onSubmit={handleImsSubmit}
          isLoading={imsSync.isLoading}
        />
      )}
      {show2bModal && (
        <TwoBCredentialModal
          gstin={gstin}
          onClose={() => setShow2bModal(false)}
          onSubmit={handle2bSubmit}
          isLoading={twoBSync.isLoading}
        />
      )}

      {activeMainTab === '3B-Reco' && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>3B-Reco coming soon</div>
      )}

      {activeMainTab === 'Return' && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Return coming soon</div>
      )}
    </div>
  );
}
