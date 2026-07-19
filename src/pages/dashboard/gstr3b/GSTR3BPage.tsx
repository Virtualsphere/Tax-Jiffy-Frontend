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
} from './hooks/useGstr3bFiling';
import { usePurchaseRegisterFilings } from '@/pages/dashboard/purchaseRegister/hooks/usePurchaseRegisterSheets';
import { useCurrentEntity } from '@/hooks/useCurrentEntity';
import { usePeriod, FY_YEARS } from '@/context/PeriodContext';
import { PeriodSelector } from '@/components/PeriodSelector/PeriodSelector';
import type {
  Gstr3bFiling,
  ImsCredentials,
  TwoBCredentials,
  Gstr3bInterestLateFeeRequest,
} from './api/gstr3bApi';

// ── Tabs ─────────────────────────────────────────────────────────────────
type Tab = 'Basic' | 'Outward' | 'Inward' | 'Payment of Tax';
const TABS: Tab[] = ['Basic', 'Outward', 'Inward', 'Payment of Tax'];

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
  const [activeTab, setActiveTab] = useState<Tab>('Basic');
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

  // ── ColDefs ──────────────────────────────────────────────────────────────
  const defaultColDef = useMemo<ColDef>(
    () => ({ resizable: true, wrapHeaderText: true, autoHeaderHeight: true }),
    [],
  );

  const R = { cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right' } as const;
  const L = { cellClass: 'ag-cell-left',  headerClass: 'ag-header-cell-left'  } as const;

  const colDefs31 = useMemo<(ColDef | ColGroupDef)[]>(() => [
    { field: 'nature_of_supply', headerName: 'Nature of Supplies', flex: 2, ...L },
    { field: 'taxable_value',    headerName: 'Taxable Value (₹)',  flex: 1, ...R },
    { headerName: 'Amount (₹)', children: [
      { field: 'integrated_tax', headerName: 'IGST', ...R },
      { field: 'central_tax',    headerName: 'CGST', ...R },
      { field: 'state_ut_tax',   headerName: 'SGST', ...R },
      { field: 'cess',           headerName: 'CESS', ...R },
    ]},
  ], []);

  const colDefs32 = useMemo<ColDef[]>(() => [
    { field: 'place_of_supply', headerName: 'Place of Supply', flex: 2, ...L },
    { field: 'taxable_value',   headerName: 'Taxable Value (₹)', flex: 1, ...R },
    { field: 'integrated_tax',  headerName: 'IGST (₹)', flex: 1, ...R },
  ], []);

  const colDefs4 = useMemo<ColDef[]>(() => [
    { field: 'detail',        headerName: 'Details', flex: 2, ...L },
    { field: 'integrated_tax',headerName: 'IGST (₹)', flex: 1, ...R },
    { field: 'central_tax',   headerName: 'CGST (₹)', flex: 1, ...R },
    { field: 'state_ut_tax',  headerName: 'SGST (₹)', flex: 1, ...R },
    { field: 'cess',          headerName: 'CESS (₹)', flex: 1, ...R },
  ], []);

  const colDefs5 = useMemo<ColDef[]>(() => [
    { field: 'nature_of_supply',      headerName: 'Nature of Supply',  flex: 2, ...L },
    { field: 'inter_state_supplies',  headerName: 'Inter-State (₹)',   flex: 1, ...R },
    { field: 'intra_state_supplies',  headerName: 'Intra-State (₹)',   flex: 1, ...R },
  ], []);

  const colDefs51 = useMemo<ColDef[]>(() => [
    { field: 'description',   headerName: 'Description', flex: 2, ...L },
    { field: 'integrated_tax',headerName: 'IGST (₹)', flex: 1, ...R },
    { field: 'central_tax',   headerName: 'CGST (₹)', flex: 1, ...R },
    { field: 'state_ut_tax',  headerName: 'SGST (₹)', flex: 1, ...R },
    { field: 'cess',          headerName: 'CESS (₹)', flex: 1, ...R },
  ], []);

  const colDefs61 = useMemo<(ColDef | ColGroupDef)[]>(() => [
    { field: 'description',     headerName: 'Description', flex: 1.5, ...L },
    { field: 'tax_payable',     headerName: 'Tax Payable', flex: 1,   ...R },
    { headerName: 'Paid through ITC', children: [
      { field: 'paid_itc_integrated', headerName: 'IGST', ...R },
      { field: 'paid_itc_central',    headerName: 'CGST', ...R },
      { field: 'paid_itc_state_ut',   headerName: 'SGST', ...R },
      { field: 'paid_itc_cess',       headerName: 'CESS', ...R },
    ]},
    { field: 'tax_paid_cash',       headerName: 'Cash', flex: 1,   ...R },
    { field: 'interest_paid_cash',  headerName: 'Interest', flex: 1, ...R },
    { field: 'late_fee_paid_cash',  headerName: 'Late Fee', flex: 1, ...R },
  ], []);

  const rowClassRules = useMemo(() => ({
    'ag-row-section-header': (p: any) => p.data?.isSectionHeader === true,
    'ag-row-total': (p: any) => p.data?.isTotal === true,
  }), []);

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

        <button
          type="button"
          className={styles.createFilingBtn}
          onClick={handleCreateFiling}
          disabled={isCreating || !companyGstId || companyGstId === 0}
        >
          {isCreating ? 'Creating…' : filing ? `Filing #${filing.id} ✓` : 'Create / Load Filing'}
        </button>
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

      {/* ── Tabs ── */}
      <div className={styles.tabsContainer}>
        {TABS.map((tab) => (
          <button key={tab} type="button" className={`${styles.tabButton} ${activeTab === tab ? styles.tabButtonActive : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {/* ═══════════════════ TAB: BASIC ═══════════════════ */}
      {activeTab === 'Basic' && (
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
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════ TAB: OUTWARD ═══════════════════ */}
      {activeTab === 'Outward' && (
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
                {expandedAccordion === '3.1' && (
                  <div className={styles.accordionContent}>
                    <div className={`${styles.gstr3bGrid} ag-theme-tax-jiffy ag-theme-blue-headers ag-theme-blue-group-headers`}>
                      <AgGridReact theme="legacy" rowData={p?.table_3_1_outward_and_reverse_charge_inward_supplies?.rows ?? []} columnDefs={colDefs31} defaultColDef={defaultColDef} domLayout="autoHeight" suppressMenuHide />
                    </div>
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
                )}
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
                {expandedAccordion === '3.2' && (
                  <div className={styles.accordionContent}>
                    <div className={`${styles.gstr3bGrid} ag-theme-tax-jiffy ag-theme-blue-headers`}>
                      <AgGridReact theme="legacy" rowData={table32Rows} columnDefs={colDefs32} defaultColDef={defaultColDef} rowClassRules={rowClassRules} domLayout="autoHeight" suppressMenuHide />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════════════ TAB: INWARD ═══════════════════ */}
      {activeTab === 'Inward' && (
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
                {expandedAccordion === 'table4' && (
                  <div className={styles.accordionContent}>
                    <div className={`${styles.gstr3bGrid} ag-theme-tax-jiffy ag-theme-blue-headers`}>
                      <AgGridReact theme="legacy" rowData={table4Rows} columnDefs={colDefs4} defaultColDef={defaultColDef} rowClassRules={rowClassRules} domLayout="autoHeight" suppressMenuHide />
                    </div>
                  </div>
                )}
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
                {expandedAccordion === 'table5' && (
                  <div className={styles.accordionContent}>
                    <div className={`${styles.gstr3bGrid} ag-theme-tax-jiffy ag-theme-blue-headers`}>
                      <AgGridReact theme="legacy" rowData={p?.table_5_exempt_nil_nongst_inward_supplies?.rows ?? []} columnDefs={colDefs5} defaultColDef={defaultColDef} domLayout="autoHeight" suppressMenuHide />
                    </div>
                  </div>
                )}
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
                {expandedAccordion === 'table5_1' && (
                  <div className={styles.accordionContent}>
                    {/* Preview table */}
                    <div className={`${styles.gstr3bGrid} ag-theme-tax-jiffy ag-theme-blue-headers`} style={{ marginBottom: 24 }}>
                      <AgGridReact theme="legacy" rowData={p?.table_5_1_interest_and_late_fee?.rows ?? []} columnDefs={colDefs51} defaultColDef={defaultColDef} domLayout="autoHeight" suppressMenuHide />
                    </div>
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
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════════════ TAB: PAYMENT OF TAX ═══════════════════ */}
      {activeTab === 'Payment of Tax' && (
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
                  <div className={`${styles.gstr3bGrid} ag-theme-tax-jiffy ag-theme-blue-headers ag-theme-blue-group-headers ag-theme-spreadsheet-borders`}>
                    <AgGridReact theme="legacy" rowData={p?.table_6_1_payment_of_tax?.rows ?? []} columnDefs={colDefs61} defaultColDef={defaultColDef} domLayout="autoHeight" suppressMenuHide />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Footer ── */}
      {filing && (
        <div className={styles.footer}>
          <button type="button" className={styles.confirmBtn} onClick={() => setIsFiled(true)}>
            Confirm Filing
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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
    </div>
  );
}
