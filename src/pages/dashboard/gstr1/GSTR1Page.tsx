import { useCallback, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useUploadSalesRegister } from '@/pages/dashboard/gstr1/hooks/useUploadSalesRegister';
import { useGstr1Match } from '@/pages/dashboard/gstr1/hooks/useGstr1Match';
import { useGstr1Draft } from '@/pages/dashboard/gstr1/hooks/useGstr1Draft';
import { usePeriod, FY_YEARS } from '@/context/PeriodContext';
import { PeriodSelector } from '@/components/PeriodSelector/PeriodSelector';
import styles from '@/pages/dashboard/gstr1/GSTR1Page.module.css';
import { GSTR1BasicTab } from './tabs/GSTR1BasicTab';
import { GSTR1OutwardTab } from './tabs/GSTR1OutwardTab';
import { GSTR1AmendmentsTab } from './tabs/GSTR1AmendmentsTab';
import { GSTR1AdvancedTab } from './tabs/GSTR1AdvancedTab';
import { GSTR1OthersTab } from './tabs/GSTR1OthersTab';
import { useCurrentEntity } from '@/hooks/useCurrentEntity';
import { Gstr1SubmitModal } from './Gstr1SubmitModal';
import { GSTR1ReconciliationTab } from './tabs/GSTR1ReconciliationTab';

import { useQuery } from '@tanstack/react-query';
import { gstr1Api } from '@/pages/dashboard/gstr1/api/gstr1.api';


/* ── Types ── */
type Step = 1 | 2 | 3;


function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── Icons ── */


function FileIcon() {
  return (
    <svg className={styles.fileIconSvg} viewBox="0 0 24 24" fill="none">
      <path
        d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 16v-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1" fill="currentColor" />
    </svg>
  );
}

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 9v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

function MatchingIcon() {
  return (
    <svg
      className={styles.matchingProgressIcon}
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="36" cy="36" r="36" fill="#5a6acf" />
      <path
        d="M44 28H26m18 0l-4-4m4 4l-4 4"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 44h18M28 44l4-4m-4 4l4 4"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Component ── */
export function GSTR1Page() {
  const [step, setStep] = useState<Step>(1);
  const { selectedYear, selectedMonth, setSelectedYear, setSelectedMonth } = usePeriod();
  const { data: currentEntity } = useCurrentEntity();

  // ── Local upload-period state (independent from global context) ──
  const [uploadYear, setUploadYear] = useState<string>(selectedYear.label);
  const [uploadMonth, setUploadMonth] = useState<string>(selectedMonth);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click / Escape
  useEffect(() => {
    if (!pickerOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (!pickerRef.current?.contains(e.target as Node)) setPickerOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPickerOpen(false); };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [pickerOpen]);

  // Helper: get calendar-year for a given GST month + FY label
  const getCalendarYear = (month: string, fyLabel: string): number => {
    const fyStart = Number(fyLabel.split('-')[0]);
    return ['January', 'February', 'March'].includes(month) ? fyStart + 1 : fyStart;
  };

  // Sync active entity period to PeriodContext AND local upload state
  useEffect(() => {
    if (currentEntity && currentEntity.id !== 0 && currentEntity.period) {
      const parts = currentEntity.period.split("'");
      if (parts.length === 2) {
        const monthAbbr = parts[0]; // e.g. "FEB"
        const year = parts[1]; // e.g. "2026"
        
        const monthNames: Record<string, string> = {
          JAN: 'January', FEB: 'February', MAR: 'March', APR: 'April', MAY: 'May', JUN: 'June',
          JUL: 'July', AUG: 'August', SEP: 'September', OCT: 'October', NOV: 'November', DEC: 'December'
        };
        const monthName = monthNames[monthAbbr.toUpperCase()] || 'October';
        
        const yearNum = Number(year);
        const isJanFebMar = ['JAN', 'FEB', 'MAR'].includes(monthAbbr.toUpperCase());
        // For Jan/Feb/Mar, the financial year starts in the previous calendar year
        const fyStart = isJanFebMar ? yearNum - 1 : yearNum;
        const fyLabel = `20${fyStart - 2000}-${String(fyStart + 1 - 2000).padStart(2, '0')}`; // e.g. "2025-26"
        
        const fyObj = FY_YEARS.find(y => y.label === fyLabel);
        if (fyObj) setSelectedYear(fyObj);
        setSelectedMonth(monthName);
        // Also seed local upload period
        setUploadYear(fyLabel);
        setUploadMonth(monthName);
      }
    }
  }, [currentEntity, setSelectedYear, setSelectedMonth]);

  // Hooks
  const upload = useUploadSalesRegister();
  const match = useGstr1Match();
  
  const activeGstId = currentEntity?.id;

  // Hook to query filings for this company
  const { data: filings } = useQuery({
    queryKey: ['gstr1-filings', activeGstId],
    queryFn: () => gstr1Api.getFilingsByCompanyGst(activeGstId!),
    enabled: !!activeGstId,
  });

  const matchingFiling = filings?.find((f: any) => 
    f.financialYear === uploadYear && 
    f.taxPeriod.toUpperCase() === uploadMonth.toUpperCase()
  );

  const activeFilingId = matchingFiling?.id || upload.data?.filingId;

  // Pass filing ID to the draft hook so it fetches compiled report data from the backend
  const draft = useGstr1Draft(activeFilingId);

  const [activeTab, setActiveTab] = useState<string>('Import');
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>('table4');

  // Submit modal state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [filedArn, setFiledArn] = useState<string | null>(null);

  // When matching completes, move to step 2
  const handleStartMatching = useCallback(() => {
    match.startMatching(activeFilingId);
  }, [match, activeFilingId]);

  // Check if matching just completed and we need to advance
  if (match.isComplete && step === 1) {
    setStep(2);
  }

  // If there's an existing filing in the DB but no active step, default to step 2 (Match & Confirm) 
  // so we skip the upload. Or if we just changed period to an existing one, set step 2.
  useEffect(() => {
    if (matchingFiling && step === 1 && !upload.isPending) {
      setStep(2);
    } else if (!matchingFiling && !upload.data && step === 2 && !match.isComplete) {
      setStep(1); // go back if there is no data
    }
  }, [matchingFiling, step, upload.isPending, upload.data, match.isComplete]);

  const handleConfirmFiling = useCallback(() => {
    setSubmitModalOpen(true);
  }, []);

  const handleSubmitSuccess = useCallback((arn: string) => {
    setFiledArn(arn);
    setSubmitModalOpen(false);
    setStep(3);
  }, []);

  const resetWizard = useCallback(() => {
    setStep(1);
    upload.reset();
    match.reset();
    setFiledArn(null);
    setActiveTab('Basic');
  }, [upload, match]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (upload.isPending || !activeGstId) return;
      const f = e.dataTransfer.files[0];
      if (f) upload.mutate(f, activeGstId, uploadYear, uploadMonth);
    },
    [upload, activeGstId, uploadYear, uploadMonth, upload.isPending],
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (upload.isPending || !activeGstId) return;
      const f = e.target.files?.[0];
      if (f) upload.mutate(f, activeGstId, uploadYear, uploadMonth);
    },
    [upload, activeGstId, uploadYear, uploadMonth, upload.isPending],
  );

  /* ── Drag state (UI-only, no data) ── */
  const [dragOver, setDragOver] = useState(false);

  /* ── Matching Progress Screen ── */
  const renderMatchingProgress = () => (
    <div className={styles.matchingCard}>
      <div className={styles.matchingProgress}>
        <MatchingIcon />
        <h3 className={styles.matchingProgressTitle}>
          Matching records with GST API...
        </h3>
        <p className={styles.matchingProgressSubtitle}>
          Please wait while we cross-reference{' '}
          {upload.data?.rows.toLocaleString() ?? '4,502'} records with the official GST
          database. This ensures your E-invoice and E-way bill data is perfectly
          aligned.
        </p>

        <div className={styles.progressBarSection}>
          <div className={styles.progressBarHeader}>
            <span className={styles.progressLabel}>Progress</span>
            <span className={styles.progressPercent}>{match.progress}%</span>
          </div>
          <div className={styles.progressBarTrack}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${match.progress}%` }}
            />
          </div>
        </div>

        <hr className={styles.progressDivider} />
      </div>
    </div>
  );


  /* ── Quick Link Helpers ── */

  const renderPeriodSelector = () => (
    <PeriodSelector
      year={uploadYear}
      month={uploadMonth}
      onYearChange={(yLabel) => {
        setUploadYear(yLabel);
        if (upload.data) upload.reset();
      }}
      onMonthChange={(mLabel) => {
        setUploadMonth(mLabel);
        if (upload.data) upload.reset();
      }}
    />
  );

  /* ── Step 1: Upload ── */
  const renderUpload = () => (
    <div className={styles.card}>
      <div className={styles.uploadHeader}>
        <div>
          <h3 className={styles.uploadTitle}>Upload Sales Register</h3>
          <p className={styles.uploadSubtitle}>
            Please use the standardized Excel template for optimal validation.
          </p>
        </div>
        <button type="button" className={styles.templateBtn}>
          ⬇ Download Template
        </button>
      </div>

      <div
        className={`${styles.dropzone} ${dragOver && !upload.isPending ? styles.dropzoneDragOver : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!upload.isPending) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          setDragOver(false);
          if (!upload.isPending) onDrop(e);
        }}
        onClick={() => {
          if (!upload.isPending) upload.inputRef.current?.click();
        }}
        role="button"
        tabIndex={upload.isPending ? -1 : 0}
        onKeyDown={(e) => {
          if (!upload.isPending && (e.key === 'Enter' || e.key === ' ')) {
            upload.inputRef.current?.click();
          }
        }}
        style={upload.isPending ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
      >
        <div className={styles.dropzoneIcon}>⬆</div>
        <p className={styles.dropzoneTitle}>Drag and drop your Excel file here</p>
        <p className={styles.dropzoneHint}>
          Supported formats: .xlsx, .xls (Max 100MB)
          <br />
          Ensure all sheets follow the template structure.
        </p>
        <button
          type="button"
          className={styles.uploadBtn}
          onClick={(e) => {
            e.stopPropagation();
            if (!upload.isPending) upload.inputRef.current?.click();
          }}
          disabled={upload.isPending}
          style={upload.isPending ? { cursor: 'not-allowed' } : {}}
        >
          Click to Upload
        </button>
        <input
          ref={upload.inputRef}
          type="file"
          accept=".xlsx,.xls"
          className={styles.hiddenInput}
          onChange={onFileChange}
          disabled={upload.isPending}
        />
      </div>

      {/* File type error */}
      {upload.isError && (
        <div className={styles.fileTypeError}>
          <div className={styles.fileTypeErrorIcon}>
            <AlertTriangleIcon className={styles.fileTypeErrorIconSvg} />
          </div>
          <div className={styles.fileTypeErrorContent}>
            <p className={styles.fileTypeErrorTitle}>Invalid File Format</p>
            <p className={styles.fileTypeErrorMessage}>{upload.error}</p>
          </div>
        </div>
      )}

      {/* Parsing / Uploading overlay */}
      {upload.isPending && (
        <div className={styles.uploadOverlay}>
          <div className={styles.parsingSpinner} />
          <div className={styles.uploadOverlayText}>
            <p className={styles.uploadOverlayTitle}>Processing file…</p>
            <p className={styles.uploadOverlaySubtitle}>Parsing and uploading GSTR-1 data to server</p>
          </div>
        </div>
      )}

      {/* Uploaded file card */}
      {upload.data && (
        <div className={styles.fileCard}>
          <div className={styles.fileIcon}>
            <FileIcon />
          </div>
          <div className={styles.fileInfo}>
            <p className={styles.fileName}>
              {upload.data.fileName}
              <span className={`${styles.fileBadge} ${upload.data.validationErrors.length > 0 ? styles.fileBadgeError : styles.fileBadgeSuccess}`}>
                {upload.data.validationErrors.length > 0 ? 'Has errors' : '✓ Data extracted'}
              </span>
            </p>
            <p className={styles.fileMeta}>
              {formatFileSize(upload.data.fileSize)}
              {upload.data.rows > 0 && ` • ${upload.data.rows.toLocaleString()} records imported`}
              {upload.data.filingId && ` • Filing ID: ${upload.data.filingId}`}
              {upload.data.parsedDraftData && ' • Ready for review'}
            </p>
          </div>
          <button
            type="button"
            className={styles.fileRemove}
            onClick={upload.reset}
            aria-label="Remove file"
          >
            ✕
          </button>
        </div>
      )}

      {/* Extraction summary */}
      {upload.data?.parsedDraftData && upload.data.validationErrors.length === 0 && (
        <div className={styles.extractionSummary}>
          <div className={styles.extractionSummaryIcon}>📊</div>
          <div className={styles.extractionSummaryContent}>
            <p className={styles.extractionSummaryTitle}>Data Successfully Extracted</p>
            <p className={styles.extractionSummaryText}>
              All worksheets parsed — outward supplies, amendments, advance data, HSN summary and documents are ready to review in the tabs below after matching.
            </p>
          </div>
        </div>
      )}

      {/* Validation error card */}
      {upload.data && upload.data.validationErrors.length > 0 && (
        <div className={styles.validationError}>
          <div className={styles.validationErrorIcon}>
            <InfoCircleIcon className={styles.validationErrorIconSvg} />
          </div>
          <div className={styles.validationErrorContent}>
            <p className={styles.validationErrorTitle}>Validation Error</p>
            {upload.data.validationErrors.map((err) => (
              <p key={err} className={styles.validationErrorMessage}>{err}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  /* ── Step 2: Match & Confirm — new 3-tab layout ── */
  const MAIN_TABS = ['Import', 'Reconciliation', 'Return'] as const;
  type MainTab = typeof MAIN_TABS[number];

  const renderMatching = () => {
    const currentMainTab = (MAIN_TABS.includes(activeTab as MainTab) ? activeTab : 'Import') as MainTab;

    return (
      <>
        {/* Main Tabs + Period Selector in one bar */}
        <div className={styles.draftSection}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f1f3f9', borderRadius: 9999, padding: '4px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {MAIN_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`${styles.draftTab} ${currentMainTab === tab ? styles.draftTabActive : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div style={{ paddingRight: '4px' }}>
              {renderPeriodSelector()}
            </div>
          </div>

          {/* ── Import Tab ── */}
          {currentMainTab === 'Import' && (
            <>
              {matchingFiling ? (
                <div className={styles.card} style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <path d="M8 16.5l5 5L24 10" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#15803d', margin: '0 0 0.25rem' }}>
                        File already uploaded for this period
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                        A filing already exists for{' '}
                        <strong>{uploadMonth} {getCalendarYear(uploadMonth, uploadYear)}</strong>.
                        To view the data, switch to the <strong>Return</strong> tab.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <button
                        type="button"
                        className={styles.proceedBtn}
                        onClick={() => setActiveTab('Return')}
                        style={{ opacity: 1 }}
                      >
                        View in Return tab →
                      </button>
                      <button
                        type="button"
                        style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}
                        onClick={() => {
                          upload.reset();
                        }}
                      >
                        Upload new file anyway
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {renderUpload()}
                  <button
                    type="button"
                    className={styles.proceedBtn}
                    disabled={!upload.data || upload.data.validationErrors.length > 0 || upload.isPending}
                    onClick={handleStartMatching}
                  >
                    {upload.isPending ? 'Processing file…' : 'Proceed to Matching →'}
                  </button>
                </>
              )}
            </>
          )}

          {/* ── Reconciliation Tab ── */}
          {currentMainTab === 'Reconciliation' && (
            <div style={{ width: '100%' }}>
              {matchingFiling?.id || upload.data?.filingId ? (
                <GSTR1ReconciliationTab filingId={matchingFiling?.id || upload.data?.filingId || 0} />
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', color: '#94a3b8' }}>
                  Please upload a sale register first to view reconciliation.
                </div>
              )}
            </div>
          )}

          {/* ── Return Tab ── */}
          {currentMainTab === 'Return' && (
            <>
              <div className={styles.draftHeader}>
                <h3 className={styles.draftTitle}>
                  <span className={styles.draftTitleIcon}>📋</span>
                  GSTR-1 Draft Preview
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className={styles.filingPeriodSync} style={{ margin: 0 }}>
                    <span className={styles.syncIcon}>ⓘ</span>
                    Data synced from GST Portal
                  </span>
                  <button type="button" className={styles.downloadDraftBtn}>
                    ⬇ Download Draft
                  </button>
                </div>
              </div>

              {draft.isLoading ? (
                <div className={styles.parsingCard} style={{ margin: '2rem 0' }}>
                  <div className={styles.parsingSpinner} />
                  <div className={styles.parsingText}>
                    <p className={styles.parsingTitle}>Loading draft data…</p>
                    <p className={styles.parsingSubtitle}>Fetching compiled GSTR-1 report from server</p>
                  </div>
                </div>
              ) : (
                <>

                  {/* All sections stacked vertically — always shown */}
                  <GSTR1BasicTab 
                    data={draft.data.rows ?? []} 
                    expandedAccordion={expandedAccordion}
                    setExpandedAccordion={setExpandedAccordion}
                  />
                  <GSTR1OutwardTab
                    data={draft.data.outwardData ?? {}}
                    expandedAccordion={expandedAccordion}
                    setExpandedAccordion={setExpandedAccordion}
                  />
                  <GSTR1AmendmentsTab
                    data={draft.data.amendmentsData ?? {}}
                    expandedAccordion={expandedAccordion}
                    setExpandedAccordion={setExpandedAccordion}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                  />
                  <GSTR1AdvancedTab
                    data={draft.data.advancedData ?? {}}
                    expandedAccordion={expandedAccordion}
                    setExpandedAccordion={setExpandedAccordion}
                  />
                  <GSTR1OthersTab
                    data={draft.data.othersData ?? {}}
                    expandedAccordion={expandedAccordion}
                    setExpandedAccordion={setExpandedAccordion}
                  />
                </>
              )}

              {/* Footer */}
              <div className={styles.matchFooter}>
                <p className={styles.matchFooterText}>
                  By proceeding, you confirm that you have reviewed
                  the matched summaries for accuracy.
                </p>
                <button
                  type="button"
                  className={styles.confirmFilingBtn}
                  onClick={handleConfirmFiling}
                >
                  Confirm & Proceed to Filing →
                </button>
              </div>
            </>
          )}
        </div>
      </>
    );
  };

  /* ── Step 3: Success ── */
  const renderSuccess = () => (
    <div className={styles.successCard}>
      <div className={styles.successContent}>
        <div className={styles.successIconWrapper}>
          <svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="44" cy="44" r="44" fill="#5A6ACF"/>
            <path d="M28 44L38 54L60 32" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className={styles.successTitle}>GSTR-1 Submitted<br />Successfully</h2>
        {filedArn && (
          <div className={styles.successArnBadge}>
            <span className={styles.successArnLabel}>Acknowledgement Reference Number (ARN)</span>
            <span className={styles.successArnValue}>{filedArn}</span>
          </div>
        )}
        <p className={styles.successSubtitle}>
          You can see the recent filed returns in the<br />
          Recent/Filled section of your dashboard.
        </p>
        <div className={styles.successActions}>
          <button type="button" className={styles.successNewFilingBtn} onClick={resetWizard}>
            Start new filing
          </button>
          <Link to={ROUTES.dashboard.root} className={styles.successDashboardBtn}>
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );

  /* Compute prefilled values for the modal */
  const prefillGstin = currentEntity?.gstin && currentEntity.gstin !== 'N/A' ? currentEntity.gstin : '';
  const prefillStateCd = prefillGstin.length >= 2 ? prefillGstin.substring(0, 2) : '';
  const prefillRetPeriod = (() => {
    const monthMap: Record<string, string> = {
      January: '01', February: '02', March: '03', April: '04',
      May: '05', June: '06', July: '07', August: '08',
      September: '09', October: '10', November: '11', December: '12',
    };
    const mm = monthMap[selectedMonth] ?? '';
    // selectedYear.label is like "2025-26"; for filing year we need the calendar year of the month
    const fyStart = Number(selectedYear.label.split('-')[0]);
    const calYear = ['January', 'February', 'March'].includes(selectedMonth)
      ? fyStart + 1
      : fyStart;
    return mm ? `${mm}${calYear}` : '';
  })();

  return (
    <div className={styles.page}>

      {/* {renderStepper()} */}

      {match.isMatching && renderMatchingProgress()}
      {!match.isMatching && step !== 3 && renderMatching()}
      {step === 3 && renderSuccess()}

      {/* Submit Modal — rendered outside flow so it overlays everything */}
      {submitModalOpen && upload.data?.filingId && (
        <Gstr1SubmitModal
          filingId={upload.data.filingId}
          prefillGstin={prefillGstin}
          prefillRetPeriod={prefillRetPeriod}
          prefillStateCd={prefillStateCd}
          onSuccess={handleSubmitSuccess}
          onClose={() => setSubmitModalOpen(false)}
        />
      )}
    </div>
  );
}
