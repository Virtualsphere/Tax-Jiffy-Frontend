import { useCallback, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useUploadSalesRegister } from '@/pages/dashboard/gstr1/hooks/useUploadSalesRegister';
import { useGstr1Match } from '@/pages/dashboard/gstr1/hooks/useGstr1Match';
import { useGstr1Draft } from '@/pages/dashboard/gstr1/hooks/useGstr1Draft';
import { PeriodSelector } from '@/components/PeriodSelector/PeriodSelector';
import { usePeriod, FY_YEARS, MONTHS } from '@/context/PeriodContext';
import styles from '@/pages/dashboard/gstr1/GSTR1Page.module.css';
import { GSTR1BasicTab } from './tabs/GSTR1BasicTab';
import { GSTR1OutwardTab } from './tabs/GSTR1OutwardTab';
import { GSTR1AmendmentsTab } from './tabs/GSTR1AmendmentsTab';
import { GSTR1AdvancedTab } from './tabs/GSTR1AdvancedTab';
import { GSTR1OthersTab } from './tabs/GSTR1OthersTab';
import { useCurrentEntity } from '@/hooks/useCurrentEntity';
import { Gstr1SubmitModal } from './Gstr1SubmitModal';


/* ── Types ── */
type Step = 1 | 2 | 3;

const STEPS = [
  { num: 1 as const, label: 'Upload & Verify' },
  { num: 2 as const, label: 'Match & Confirm' },
  { num: 3 as const, label: 'Success' },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── Icons ── */
function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M5 10.5l3.5 3.5L15 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
  const [uploadDay, setUploadDay] = useState<number>(new Date().getDate());
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

  // Helper: days in a given month/year
  const daysInMonth = (month: string, fyLabel: string): number => {
    const calYear = getCalendarYear(month, fyLabel);
    const monthIndex = new Date(`${month} 1, ${calYear}`).getMonth();
    return new Date(calYear, monthIndex + 1, 0).getDate();
  };

  // Clamp day when month changes
  const clampDay = (day: number, month: string, fyLabel: string) =>
    Math.min(day, daysInMonth(month, fyLabel));

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
        setUploadDay(clampDay(new Date().getDate(), monthName, fyLabel));
      }
    }
  }, [currentEntity, setSelectedYear, setSelectedMonth]);

  // Hooks
  const upload = useUploadSalesRegister();
  const match = useGstr1Match();
  // Pass filing ID to the draft hook so it fetches compiled report data from the backend
  const draft = useGstr1Draft(upload.data?.filingId);

  const [activeTab, setActiveTab] = useState<string>('Basic');
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>('table4');

  // Submit modal state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [filedArn, setFiledArn] = useState<string | null>(null);

  // When matching completes, move to step 2
  const handleStartMatching = useCallback(() => {
    match.startMatching(upload.data?.filingId);
  }, [match, upload.data?.filingId]);

  // Check if matching just completed and we need to advance
  if (match.isComplete && step === 1) {
    setStep(2);
  }

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

  const activeGstId = currentEntity?.id || 1;

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) upload.mutate(f, activeGstId, uploadYear, uploadMonth);
    },
    [upload, activeGstId, uploadYear, uploadMonth],
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) upload.mutate(f, activeGstId, uploadYear, uploadMonth);
    },
    [upload, activeGstId, uploadYear, uploadMonth],
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

  /* ── Stepper ── */
  const renderStepper = () => (
    <div className={styles.stepper}>
      {STEPS.map((s, i) => {
        const isActive = step === s.num;
        const isCompleted = step > s.num;

        return (
          <div key={s.num} style={{ display: 'contents' }}>
            <div className={styles.step}>
              <div
                className={`${styles.stepCircle} ${
                  isCompleted
                    ? styles.stepCircleCompleted
                    : isActive
                      ? styles.stepCircleActive
                      : styles.stepCircleInactive
                }`}
              >
                {isCompleted ? <CheckIcon /> : s.num}
              </div>
              <span
                className={`${styles.stepLabel} ${
                  isCompleted
                    ? styles.stepLabelCompleted
                    : isActive
                      ? styles.stepLabelActive
                      : styles.stepLabelInactive
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`${styles.stepLine} ${
                  isCompleted ? styles.stepLineCompleted : styles.stepLineInactive
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
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

      {/* ── Filing Period Dropdown Trigger ── */}
      <div className={styles.periodDropdownWrap} ref={pickerRef}>
        <button
          type="button"
          className={styles.periodTrigger}
          onClick={() => setPickerOpen(o => !o)}
          aria-haspopup="dialog"
          aria-expanded={pickerOpen}
        >
          <span className={styles.periodTriggerIcon}>📅</span>
          <span className={styles.periodTriggerLabel}>Filing Period</span>
          <span className={styles.periodTriggerValue}>
            {uploadDay} {uploadMonth.slice(0, 3)} {getCalendarYear(uploadMonth, uploadYear)}
            &nbsp;·&nbsp;FY {uploadYear}
          </span>
          <svg className={`${styles.periodTriggerChevron} ${pickerOpen ? styles.periodTriggerChevronOpen : ''}`} width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* ── Dropdown Panel ── */}
        {pickerOpen && (
          <div className={styles.periodDropdown} role="dialog" aria-label="Select filing period">

            {/* Section header */}
            <div className={styles.periodDropdownHead}>
              <span className={styles.periodDropdownTitle}>Select Filing Period</span>
              <button type="button" className={styles.periodDropdownClose} onClick={() => setPickerOpen(false)} aria-label="Close">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 14 14">
                  <path d="M2 2l10 10M12 2L2 12" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className={styles.periodDropdownBody}>

              {/* Col 1 — FY */}
              <div className={styles.pdCol}>
                <p className={styles.pdLabel}>FINANCIAL YEAR</p>
                <div className={styles.pdFyList}>
                  {FY_YEARS.map((fy) => (
                    <button
                      key={fy.label}
                      type="button"
                      className={`${styles.pdFyBtn} ${uploadYear === fy.label ? styles.pdFyBtnActive : ''}`}
                      onClick={() => {
                        setUploadYear(fy.label);
                        setUploadDay(clampDay(uploadDay, uploadMonth, fy.label));
                        if (upload.data) upload.reset();
                      }}
                    >
                      {fy.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.pdDivider} />

              {/* Col 2 — Month */}
              <div className={styles.pdCol}>
                <p className={styles.pdLabel}>MONTH</p>
                <div className={styles.pdMonthGrid}>
                  {MONTHS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`${styles.pdMonthBtn} ${uploadMonth === m ? styles.pdMonthBtnActive : ''}`}
                      onClick={() => {
                        setUploadMonth(m);
                        setUploadDay(clampDay(uploadDay, m, uploadYear));
                        if (upload.data) upload.reset();
                      }}
                    >
                      {m.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.pdDivider} />

              {/* Col 3 — Day calendar */}
              <div className={styles.pdCol}>
                <p className={styles.pdLabel}>
                  {uploadMonth.slice(0, 3).toUpperCase()} {getCalendarYear(uploadMonth, uploadYear)}
                </p>
                <div className={styles.pdWeekRow}>
                  {['S','M','T','W','T','F','S'].map((d, i) => (
                    <span key={i} className={styles.pdWeekLabel}>{d}</span>
                  ))}
                </div>
                <div className={styles.pdDayGrid}>
                  {Array.from({
                    length: new Date(
                      getCalendarYear(uploadMonth, uploadYear),
                      new Date(`${uploadMonth} 1, ${getCalendarYear(uploadMonth, uploadYear)}`).getMonth(),
                      1
                    ).getDay()
                  }).map((_, i) => <span key={`b${i}`} />)}
                  {Array.from({ length: daysInMonth(uploadMonth, uploadYear) }, (_, i) => i + 1).map(day => (
                    <button
                      key={day}
                      type="button"
                      className={`${styles.pdDayBtn} ${uploadDay === day ? styles.pdDayBtnActive : ''}`}
                      onClick={() => {
                        setUploadDay(day);
                        if (upload.data) upload.reset();
                        setPickerOpen(false); // auto-close after day selected
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      <div
        className={`${styles.dropzone} ${dragOver ? styles.dropzoneDragOver : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          setDragOver(false);
          onDrop(e);
        }}
        onClick={() => upload.inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') upload.inputRef.current?.click();
        }}
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
            upload.inputRef.current?.click();
          }}
        >
          Click to Upload
        </button>
        <input
          ref={upload.inputRef}
          type="file"
          accept=".xlsx,.xls"
          className={styles.hiddenInput}
          onChange={onFileChange}
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

      {/* Parsing / Uploading spinner */}
      {upload.isPending && (
        <div className={styles.parsingCard}>
          <div className={styles.parsingSpinner} />
          <div className={styles.parsingText}>
            <p className={styles.parsingTitle}>Processing file…</p>
            <p className={styles.parsingSubtitle}>Parsing and uploading GSTR-1 data to server</p>
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

  /* ── Step 2: Match & Confirm ── */
  const renderMatching = () => (
    <>
      {/* Header */}
      <div className={styles.matchPageHeader}>
        <h2 className={styles.matchPageTitle}>GSTR-1 Matching & Confirmation</h2>
        <p className={styles.matchPageSubtitle}>
          Review the matched results from the GST API before proceeding to file. Ensure
          all mismatch discrepancies are resolved.
        </p>
      </div>

      {/* Stats */}
      <div className={styles.matchStats}>
        <div className={styles.matchStatCard}>
          <div className={`${styles.matchStatIcon} ${styles.matchStatIconBlue}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="10" fill="#5a6acf" />
              <path d="M6 10.5l2.5 2.5L14 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className={styles.matchStatValue}>{match.matchStats?.matched.toLocaleString() ?? '—'}</p>
            <p className={styles.matchStatLabel}>MATCHED</p>
          </div>
        </div>
        <div className={styles.matchStatCard}>
          <div className={`${styles.matchStatIcon} ${styles.matchStatIconRed}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M8.66 2.5L1.22 15.5a1.5 1.5 0 001.28 2.25h14.88a1.5 1.5 0 001.28-2.25L11.22 2.5a1.5 1.5 0 00-2.56 0z" fill="#dc2626" />
              <path d="M10 7v4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="10" cy="14" r="0.75" fill="#fff" />
            </svg>
          </div>
          <div>
            <p className={styles.matchStatValue}>{match.matchStats?.mismatched.toLocaleString() ?? '—'}</p>
            <p className={styles.matchStatLabel}>MISMATCHED</p>
          </div>
        </div>
        <div className={styles.matchStatCard}>
          <div className={`${styles.matchStatIcon} ${styles.matchStatIconGray}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2 5h16M2 10h16M2 15h16" stroke="#8b8fa3" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M4 3l12 14" stroke="#8b8fa3" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className={styles.matchStatValue}>{match.matchStats?.missingInSystem.toLocaleString() ?? '—'}</p>
            <p className={styles.matchStatLabel}>MISSING IN SYSTEM</p>
          </div>
        </div>
      </div>

      {/* Draft Preview */}
      <div className={styles.draftSection}>
        <div className={styles.draftHeader}>
          <h3 className={styles.draftTitle}>
            <span className={styles.draftTitleIcon}>📋</span>
            GSTR-1 Draft Preview
          </h3>
          <button type="button" className={styles.downloadDraftBtn}>
            ⬇ Download Draft
          </button>
        </div>

        {/* Tabs & Content Area */}
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
            {/* Tabs */}
            <div className={styles.draftTabs}>
              {draft.data.tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`${styles.draftTab} ${activeTab === tab ? styles.draftTabActive : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                  {draft.data.tabBadges[tab] != null && (
                    <span className={styles.draftTabBadge}>{draft.data.tabBadges[tab]}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className={activeTab === 'Basic' ? styles.draftTableWrap : ''}>
              <div className={styles.draftFilingPeriod} style={activeTab !== 'Basic' ? { border: 'none', background: 'transparent', paddingLeft: 0, paddingRight: 0 } : {}}>
                <span className={styles.filingPeriodLabel}>FILING PERIOD</span>
                <span className={styles.filingPeriodYear}>FY {uploadYear}</span>
                <span className={styles.filingPeriodMonth}>
                  {uploadDay} {uploadMonth} {getCalendarYear(uploadMonth, uploadYear)}
                </span>
                <span className={styles.filingPeriodSync}>
                  <span className={styles.syncIcon}>ⓘ</span>
                  Data synced from GST Portal
                </span>
              </div>

              {activeTab === 'Basic' && <GSTR1BasicTab data={draft.data.rows} />}
              {activeTab === 'Outward' && draft.data.outwardData && <GSTR1OutwardTab data={draft.data.outwardData} expandedAccordion={expandedAccordion} setExpandedAccordion={setExpandedAccordion} />}
              {activeTab === 'Amendments' && draft.data.amendmentsData && <GSTR1AmendmentsTab data={draft.data.amendmentsData} expandedAccordion={expandedAccordion} setExpandedAccordion={setExpandedAccordion} selectedMonth={selectedMonth} selectedYear={selectedYear} />}
              {activeTab === 'Advanced' && draft.data.advancedData && <GSTR1AdvancedTab data={draft.data.advancedData} expandedAccordion={expandedAccordion} setExpandedAccordion={setExpandedAccordion} />}
              {activeTab === 'Others' && draft.data.othersData && <GSTR1OthersTab data={draft.data.othersData} expandedAccordion={expandedAccordion} setExpandedAccordion={setExpandedAccordion} />}
            </div>
          </>
        )}
      </div>

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
  );

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
      {step !== 2 && (
        <>
          <h2 className={styles.pageTitle}>GSTR-1 Filing</h2>
          <p className={styles.pageSubtitle}>
            Step {step} of 3: {STEPS[step - 1].label}
          </p>
        </>
      )}

      {renderStepper()}

      {step === 1 && !match.isMatching && (
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

      {step === 1 && match.isMatching && renderMatchingProgress()}

      {step === 2 && !match.isMatching && renderMatching()}
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
