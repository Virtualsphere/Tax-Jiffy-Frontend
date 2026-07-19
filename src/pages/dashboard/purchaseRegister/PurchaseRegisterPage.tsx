import { useCallback, useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ColGroupDef } from 'ag-grid-community';
import { useUploadPurchaseRegister } from './hooks/useUploadPurchaseRegister';
import { usePurchaseRegisterSheets } from './hooks/usePurchaseRegisterSheets';
import { usePeriod, FY_YEARS } from '@/context/PeriodContext';
import { PeriodSelector } from '@/components/PeriodSelector/PeriodSelector';
import { useCurrentEntity } from '@/hooks/useCurrentEntity';
import styles from './PurchaseRegisterPage.module.css';

// ── Tabs ─────────────────────────────────────────────────────────────────
type SheetTab =
  | 'B2B'
  | 'B2BUR'
  | 'CDNR'
  | 'CDNUR'
  | 'IMPG'
  | 'IMPS'
  | 'AT'
  | 'AT ADJ'
  | 'EXEMP'
  | 'ITC Reversal'
  | 'HSN Summary';

const SHEET_TABS: SheetTab[] = [
  'B2B', 'B2BUR', 'CDNR', 'CDNUR', 'IMPG', 'IMPS', 'AT', 'AT ADJ', 'EXEMP', 'ITC Reversal', 'HSN Summary',
];

type Step = 1 | 2 | 3;
const STEPS = [
  { num: 1 as const, label: 'Upload & Verify' },
  { num: 2 as const, label: 'Review Sheets' },
  { num: 3 as const, label: 'Success' },
];

// ── Helpers ───────────────────────────────────────────────────────────────
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}


// ── Icons ─────────────────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M5 10.5l3.5 3.5L15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg className={styles.fileIconSvg} viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Column defs ───────────────────────────────────────────────────────────
function usePrColDefs(activeTab: SheetTab): (ColDef | ColGroupDef)[] {
  return useMemo(() => {
    const L = { cellClass: 'ag-cell-left', headerClass: 'ag-header-cell-left' };
    const R = { cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right' };

    const itcGroup = (suffix = '') => ({
      headerName: `ITC Availed${suffix}`,
      children: [
        { field: 'availedItcIntegratedTax', headerName: 'IGST', ...R },
        { field: 'availedItcCentralTax',    headerName: 'CGST', ...R },
        { field: 'availedItcStateUtTax',    headerName: 'SGST', ...R },
        { field: 'availedItcCess',          headerName: 'CESS', ...R },
      ],
    });

    const taxGroup = (prefix = 'paid') => ({
      headerName: 'Tax Amount',
      children: [
        { field: `integratedTax${prefix === 'paid' ? 'Paid' : 'Amount'}`, headerName: 'IGST', ...R },
        { field: `centralTax${prefix === 'paid' ? 'Paid' : 'Amount'}`,    headerName: 'CGST', ...R },
        { field: `stateUtTax${prefix === 'paid' ? 'Paid' : 'Amount'}`,    headerName: 'SGST', ...R },
        { field: `cess${prefix === 'paid' ? 'Paid' : 'Amount'}`,          headerName: 'CESS', ...R },
      ],
    });

    switch (activeTab) {
      case 'B2B':
        return [
          { field: 'gstinOfSupplier',    headerName: 'GSTIN of Supplier', flex: 1.5, ...L },
          { field: 'invoiceNumber',      headerName: 'Invoice No.',        flex: 1,   ...L },
          { field: 'invoiceDate',        headerName: 'Invoice Date',       flex: 1,   ...L },
          { field: 'invoiceValue',       headerName: 'Invoice Value',      flex: 1,   ...R },
          { field: 'placeOfSupply',      headerName: 'Place of Supply',    flex: 1,   ...L },
          { field: 'reverseCharge',      headerName: 'Rev. Charge',        flex: 0.7, ...L },
          { field: 'invoiceType',        headerName: 'Invoice Type',       flex: 1,   ...L },
          { field: 'rate',               headerName: 'Rate (%)',           flex: 0.7, ...R },
          { field: 'taxableValue',       headerName: 'Taxable Value',      flex: 1,   ...R },
          taxGroup('paid'),
          { field: 'eligibilityForItc',  headerName: 'ITC Eligibility',   flex: 1,   ...L },
          itcGroup(),
        ];

      case 'B2BUR':
        return [
          { field: 'supplierName',       headerName: 'Supplier Name',      flex: 1.5, ...L },
          { field: 'invoiceNumber',      headerName: 'Invoice No.',        flex: 1,   ...L },
          { field: 'invoiceDate',        headerName: 'Invoice Date',       flex: 1,   ...L },
          { field: 'invoiceValue',       headerName: 'Invoice Value',      flex: 1,   ...R },
          { field: 'placeOfSupply',      headerName: 'Place of Supply',    flex: 1,   ...L },
          { field: 'rate',               headerName: 'Rate (%)',           flex: 0.7, ...R },
          { field: 'taxableValue',       headerName: 'Taxable Value',      flex: 1,   ...R },
          taxGroup('paid'),
          { field: 'eligibilityForItc',  headerName: 'ITC Eligibility',   flex: 1,   ...L },
          itcGroup(),
        ];

      case 'CDNR':
        return [
          { field: 'gstinOfSupplier',              headerName: 'GSTIN of Supplier', flex: 1.5, ...L },
          { field: 'noteRefundVoucherNumber',       headerName: 'Note/Voucher No.',  flex: 1,   ...L },
          { field: 'noteRefundVoucherDate',         headerName: 'Note Date',         flex: 1,   ...L },
          { field: 'documentType',                  headerName: 'Doc Type',          flex: 0.8, ...L },
          { field: 'reasonForIssuingDocument',      headerName: 'Reason',            flex: 1.2, ...L },
          { field: 'noteRefundVoucherValue',         headerName: 'Note Value',        flex: 1,   ...R },
          { field: 'rate',                          headerName: 'Rate (%)',          flex: 0.7, ...R },
          { field: 'taxableValue',                  headerName: 'Taxable Value',     flex: 1,   ...R },
          taxGroup('paid'),
          itcGroup(),
        ];

      case 'CDNUR':
        return [
          { field: 'documentType',             headerName: 'Doc Type',      flex: 0.8, ...L },
          { field: 'noteRefundVoucherNumber',  headerName: 'Note No.',      flex: 1,   ...L },
          { field: 'noteRefundVoucherDate',    headerName: 'Note Date',     flex: 1,   ...L },
          { field: 'reasonForIssuingDocument', headerName: 'Reason',        flex: 1.2, ...L },
          { field: 'noteRefundVoucherValue',    headerName: 'Note Value',    flex: 1,   ...R },
          { field: 'rate',                     headerName: 'Rate (%)',      flex: 0.7, ...R },
          { field: 'taxableValue',             headerName: 'Taxable Value', flex: 1,   ...R },
          taxGroup('paid'),
          itcGroup(),
        ];

      case 'IMPG':
        return [
          { field: 'portCode',           headerName: 'Port Code',          flex: 1,   ...L },
          { field: 'billOfEntryNumber',  headerName: 'Bill of Entry No.',  flex: 1.2, ...L },
          { field: 'billOfEntryDate',    headerName: 'Bill of Entry Date', flex: 1,   ...L },
          { field: 'billOfEntryValue',   headerName: 'BoE Value',          flex: 1,   ...R },
          { field: 'taxableValue',       headerName: 'Taxable Value',      flex: 1,   ...R },
          { field: 'integratedTaxPaid',  headerName: 'IGST Paid',          flex: 1,   ...R },
          { field: 'cessPaid',           headerName: 'CESS Paid',          flex: 1,   ...R },
        ];

      case 'IMPS':
        return [
          { field: 'documentNumber',     headerName: 'Document No.',      flex: 1.2, ...L },
          { field: 'documentDate',       headerName: 'Document Date',     flex: 1,   ...L },
          { field: 'documentValue',      headerName: 'Document Value',    flex: 1,   ...R },
          { field: 'placeOfSupply',      headerName: 'Place of Supply',   flex: 1,   ...L },
          { field: 'taxableValue',       headerName: 'Taxable Value',     flex: 1,   ...R },
          taxGroup('paid'),
          itcGroup(),
        ];

      case 'AT':
        return [
          { field: 'placeOfSupply',          headerName: 'Place of Supply',       flex: 1.2, ...L },
          { field: 'rate',                   headerName: 'Rate (%)',              flex: 0.7, ...R },
          { field: 'grossAdvancePaid',       headerName: 'Gross Advance Paid',    flex: 1,   ...R },
          taxGroup('paid'),
          itcGroup(),
        ];

      case 'AT ADJ':
        return [
          { field: 'placeOfSupply',              headerName: 'Place of Supply',          flex: 1.2, ...L },
          { field: 'rate',                       headerName: 'Rate (%)',                 flex: 0.7, ...R },
          { field: 'grossAdvancePaidAdjusted',   headerName: 'Advance Adjusted',         flex: 1,   ...R },
          taxGroup('paid'),
          itcGroup(),
        ];

      case 'EXEMP':
        return [
          { field: 'descriptionOfSupply',              headerName: 'Description',           flex: 2, ...L },
          { field: 'nilRatedSupplies',                 headerName: 'Nil Rated',             flex: 1, ...R },
          { field: 'exemptedOtherThanNilRatedNonGst',  headerName: 'Exempted',              flex: 1, ...R },
          { field: 'nonGstSupplies',                   headerName: 'Non-GST',               flex: 1, ...R },
        ];

      case 'ITC Reversal':
        return [
          { field: 'itcReversalReason',     headerName: 'Reason',            flex: 2,   ...L },
          { field: 'taxableValue',          headerName: 'Taxable Value',      flex: 1,   ...R },
          { field: 'integratedTaxAmount',   headerName: 'IGST',              flex: 1,   ...R },
          { field: 'centralTaxAmount',      headerName: 'CGST',              flex: 1,   ...R },
          { field: 'stateUtTaxAmount',      headerName: 'SGST',              flex: 1,   ...R },
          { field: 'cessAmount',            headerName: 'CESS',              flex: 1,   ...R },
        ];

      case 'HSN Summary':
        return [
          { field: 'hsn',                  headerName: 'HSN Code',          flex: 1,   ...L },
          { field: 'description',          headerName: 'Description',       flex: 2,   ...L },
          { field: 'uqc',                  headerName: 'UQC',               flex: 0.7, ...L },
          { field: 'totalQuantity',        headerName: 'Qty',               flex: 0.8, ...R },
          { field: 'totalValue',           headerName: 'Total Value',       flex: 1,   ...R },
          { field: 'taxableValue',         headerName: 'Taxable Value',     flex: 1,   ...R },
          { field: 'integratedTaxAmount',  headerName: 'IGST',              flex: 1,   ...R },
          { field: 'centralTaxAmount',     headerName: 'CGST',              flex: 1,   ...R },
          { field: 'stateUtTaxAmount',     headerName: 'SGST',              flex: 1,   ...R },
          { field: 'cessAmount',           headerName: 'CESS',              flex: 1,   ...R },
        ];

      default:
        return [];
    }
  }, [activeTab]);
}

// ── Main Component ────────────────────────────────────────────────────────
export function PurchaseRegisterPage() {
  const [step, setStep] = useState<Step>(1);
  const [activeTab, setActiveTab] = useState<SheetTab>('B2B');
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

  const { selectedYear, selectedMonth, setSelectedYear, setSelectedMonth } = usePeriod();
  const { data: currentEntity } = useCurrentEntity();

  const upload = useUploadPurchaseRegister();
  const sheets = usePurchaseRegisterSheets(step === 2 ? upload.data?.filingId : null);

  // Automatically send user to GSTR-3B section when upload is successful
  useEffect(() => {
    if (upload.data?.filingId) {
      navigate('/dashboard/gstr-3b');
    }
  }, [upload.data?.filingId, navigate]);

  const colDefs = usePrColDefs(activeTab);

  const defaultColDef = useMemo<ColDef>(
    () => ({ resizable: true, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 }),
    [],
  );

  const activeGstId = currentEntity?.id || 1;

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) upload.mutate(f, activeGstId, selectedYear.label, selectedMonth);
    },
    [upload, activeGstId, selectedYear, selectedMonth],
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) upload.mutate(f, activeGstId, selectedYear.label, selectedMonth);
    },
    [upload, activeGstId, selectedYear, selectedMonth],
  );

  const handleProceed = useCallback(() => setStep(2), []);
  const handleReset = useCallback(() => {
    setStep(1);
    upload.reset();
    setActiveTab('B2B');
  }, [upload]);

  // Tab row data mapping
  const tabRowData: Record<SheetTab, unknown[]> = {
    'B2B':         sheets.b2b,
    'B2BUR':       sheets.b2bur,
    'CDNR':        sheets.cdnr,
    'CDNUR':       sheets.cdnur,
    'IMPG':        sheets.impg,
    'IMPS':        sheets.imps,
    'AT':          sheets.at,
    'AT ADJ':      sheets.atadj,
    'EXEMP':       sheets.exemp,
    'ITC Reversal':sheets.itcr,
    'HSN Summary': sheets.hsnSum,
  };

  /* ── Step 1: Upload ── */
  const renderUpload = () => (
    <div className={styles.card}>
      <div className={styles.uploadHeader}>
        <div>
          <h3 className={styles.uploadTitle}>Upload Purchase Register</h3>
          <p className={styles.uploadSubtitle}>
            Upload your GSTR-2 Excel file (purchase returns). All sheets will be parsed automatically.
          </p>
        </div>
        <div className={styles.periodRow}>
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
      </div>

      <div
        className={`${styles.dropzone} ${dragOver ? styles.dropzoneDragOver : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { setDragOver(false); onDrop(e); }}
        onClick={() => upload.inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') upload.inputRef.current?.click(); }}
      >
        <div className={styles.dropzoneIcon}><UploadIcon /></div>
        <p className={styles.dropzoneTitle}>Drag and drop your GSTR-2 Excel file here</p>
        <p className={styles.dropzoneHint}>Supported formats: .xlsx, .xls · Max 100 MB</p>
        <button type="button" className={styles.uploadBtn} onClick={(e) => { e.stopPropagation(); upload.inputRef.current?.click(); }}>
          Click to Upload
        </button>
        <input ref={upload.inputRef} type="file" accept=".xlsx,.xls" className={styles.hiddenInput} onChange={onFileChange} />
      </div>

      {/* Error */}
      {upload.isError && (
        <div className={styles.errorBanner}>
          <span className={styles.errorIcon}>⚠</span>
          <p>{upload.error}</p>
        </div>
      )}

      {/* Uploading spinner */}
      {upload.isPending && (
        <div className={styles.parsingCard}>
          <div className={styles.parsingSpinner} />
          <div className={styles.parsingText}>
            <p className={styles.parsingTitle}>Processing file…</p>
            <p className={styles.parsingSubtitle}>Parsing all sheets and uploading to server</p>
          </div>
        </div>
      )}

      {/* File card */}
      {upload.data && (
        <div className={styles.fileCard}>
          <div className={styles.fileIcon}><FileIcon /></div>
          <div className={styles.fileInfo}>
            <p className={styles.fileName}>
              {upload.data.fileName}
              <span className={styles.fileBadgeSuccess}>✓ {upload.data.rows.toLocaleString()} rows imported</span>
            </p>
            <p className={styles.fileMeta}>{formatFileSize(upload.data.fileSize)} · Filing ID: {upload.data.filingId}</p>
          </div>
          <button type="button" className={styles.fileRemove} onClick={upload.reset} aria-label="Remove file">✕</button>
        </div>
      )}

      {upload.data && (
        <div className={styles.extractionSummary}>
          <span className={styles.extractionIcon}>📊</span>
          <div>
            <p className={styles.extractionTitle}>All sheets parsed successfully</p>
            <p className={styles.extractionText}>
              B2B · B2BUR · CDNR · CDNUR · IMPG · IMPS · AT · AT ADJ · EXEMP · ITC Reversal · HSN Summary are ready to review.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  /* ── Step 2: Review Sheets ── */
  const renderReview = () => (
    <>
      <div className={styles.reviewHeader}>
        <div>
          <h2 className={styles.reviewTitle}>Purchase Register — Sheet Review</h2>
          <p className={styles.reviewSubtitle}>
            Review all parsed sheets below. Filing ID: <strong>{upload.data?.filingId}</strong> ·{' '}
            {upload.data?.rows.toLocaleString()} total rows
          </p>
        </div>
        <button type="button" className={styles.newUploadBtn} onClick={handleReset}>
          ↩ New Upload
        </button>
      </div>

      {/* Sheet tabs */}
      <div className={styles.sheetTabs}>
        {SHEET_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`${styles.sheetTab} ${activeTab === tab ? styles.sheetTabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tabRowData[tab].length > 0 && (
              <span className={styles.sheetTabBadge}>{tabRowData[tab].length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className={styles.gridCard}>
        {sheets.isLoading ? (
          <div className={styles.parsingCard}>
            <div className={styles.parsingSpinner} />
            <div className={styles.parsingText}>
              <p className={styles.parsingTitle}>Loading sheets…</p>
            </div>
          </div>
        ) : tabRowData[activeTab].length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyStateText}>No records in this sheet for the uploaded filing.</p>
          </div>
        ) : (
          <div
            className="ag-theme-tax-jiffy ag-theme-blue-headers"
            style={{ width: '100%', minHeight: 400 }}
          >
            <AgGridReact
              theme="legacy"
              rowData={tabRowData[activeTab] as any[]}
              columnDefs={colDefs}
              defaultColDef={defaultColDef}
              domLayout="autoHeight"
              suppressMenuHide
              pagination
              paginationPageSize={50}
            />
          </div>
        )}
      </div>

      <div className={styles.reviewFooter}>
        <p className={styles.reviewFooterNote}>
          All data shown is read-only. This filing is linked to Filing ID {upload.data?.filingId}.
        </p>
        <button type="button" className={styles.confirmBtn} onClick={() => setStep(3)}>
          Mark as Reviewed →
        </button>
      </div>
    </>
  );

  /* ── Step 3: Success ── */
  const renderSuccess = () => (
    <div className={styles.successCard}>
      <div className={styles.successContent}>
        <div className={styles.successIconWrapper}>
          <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
            <circle cx="44" cy="44" r="44" fill="#5A6ACF" />
            <path d="M28 44L38 54L60 32" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className={styles.successTitle}>Purchase Register Uploaded<br />Successfully</h2>
        <p className={styles.successSubtitle}>
          Filing ID <strong>{upload.data?.filingId}</strong> is saved and linked. You can now use this data in your GSTR-3B reconciliation.
        </p>
        <div className={styles.successActions}>
          <button type="button" className={styles.successNewBtn} onClick={handleReset}>
            Upload Another
          </button>
        </div>
      </div>
    </div>
  );

  /* ── Stepper ── */
  const renderStepper = () => (
    <div className={styles.stepper}>
      {STEPS.map((s, i) => {
        const isActive = step === s.num;
        const isCompleted = step > s.num;
        return (
          <div key={s.num} style={{ display: 'contents' }}>
            <div className={styles.step}>
              <div className={`${styles.stepCircle} ${isCompleted ? styles.stepCircleCompleted : isActive ? styles.stepCircleActive : styles.stepCircleInactive}`}>
                {isCompleted ? <CheckIcon /> : s.num}
              </div>
              <span className={`${styles.stepLabel} ${isCompleted ? styles.stepLabelCompleted : isActive ? styles.stepLabelActive : styles.stepLabelInactive}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`${styles.stepLine} ${isCompleted ? styles.stepLineCompleted : styles.stepLineInactive}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={styles.page}>
      {step !== 2 && (
        <>
          <h2 className={styles.pageTitle}>Purchase Register</h2>
          <p className={styles.pageSubtitle}>Step {step} of 3: {STEPS[step - 1].label}</p>
        </>
      )}

      {renderStepper()}

      {step === 1 && (
        <>
          {renderUpload()}
          <button
            type="button"
            className={styles.proceedBtn}
            disabled={!upload.data || upload.isPending}
            onClick={handleProceed}
          >
            {upload.isPending ? 'Processing…' : 'Review Parsed Sheets →'}
          </button>
        </>
      )}

      {step === 2 && renderReview()}
      {step === 3 && renderSuccess()}
    </div>
  );
}
