import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import styles from '@/pages/dashboard/gstr1/GSTR1Page.module.css';

/* ── Types ── */
type UploadedFile = {
  name: string;
  size: number;
  rows: number;
};

type Step = 1 | 2 | 3;

const STEPS = [
  { num: 1 as const, label: 'Upload & Verify' },
  { num: 2 as const, label: 'Match & Confirm' },
  { num: 3 as const, label: 'Success' },
];

/* ── Draft Preview Data ── */
const DRAFT_TABS = ['Basic', 'Outward', 'Amendments', 'Advanced', 'Others'] as const;
const DRAFT_TAB_BADGES: Record<string, number | null> = {
  Basic: null,
  Outward: 3,
  Amendments: 2,
  Advanced: null,
  Others: null,
};

const DRAFT_ROWS = [
  { sr: '1', label: 'GSTIN', sub: 'Goods and Services Tax Identification Number', value: '27AAACR1234A 1Z5', highlight: true },
  { sr: '2(a)', label: 'Legal Name', sub: 'As per PAN database', value: 'GLOBAL SOLUTIONS PRIVATE LIMITED', highlight: false },
  { sr: '2(b)', label: 'Trade Name', sub: 'If different from legal name', value: 'GLOBAL TECH SERVICES', highlight: false },
  { sr: '3(a)', label: 'Aggregate Turnover (Preceding FY)', sub: 'Turnover for financial year 2022-23', value: '₹ 4,50,00,000.00', highlight: false },
  { sr: '3(b)', label: 'Aggregate Turnover (Apr-Jun 2017)', sub: 'Historical turnover context', value: '₹ 1,20,00,000.00', highlight: false },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── Allowed file extensions ── */
const ALLOWED_EXTENSIONS = ['.xlsx', '.xls'];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

function isExcelFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
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
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileTypeError, setFileTypeError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [matchProgress, setMatchProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Simulate matching progress when isMatching is true
  useEffect(() => {
    if (!isMatching) return;

    setMatchProgress(0);
    let current = 0;
    const interval = setInterval(() => {
      // Increment by random amount (2-8%) for realistic feel
      current += Math.random() * 6 + 2;
      if (current >= 100) {
        current = 100;
        setMatchProgress(100);
        clearInterval(interval);
        // Short pause at 100% then transition to results
        setTimeout(() => {
          setIsMatching(false);
          setStep(2);
        }, 500);
      } else {
        setMatchProgress(Math.round(current));
      }
    }, 300);

    return () => clearInterval(interval);
  }, [isMatching]);

  const handleFile = useCallback((f: File) => {
    // Reset errors
    setFileTypeError(null);
    setValidationErrors([]);

    // Validate file type
    if (!isExcelFile(f)) {
      setFileTypeError(
        `"${f.name}" is not a supported file format. Please upload an Excel file (.xlsx or .xls).`,
      );
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    // Validate file size
    if (f.size > MAX_FILE_SIZE) {
      setFileTypeError(
        `File size (${formatFileSize(f.size)}) exceeds the 25MB limit. Please upload a smaller file.`,
      );
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    // Simulate parsing rows from Excel file
    const mockRows = Math.floor(f.size / 250) + Math.floor(Math.random() * 2000) + 1000;
    setFile({
      name: f.name,
      size: f.size,
      rows: mockRows,
    });

    // Simulate validation — in real app this would parse the Excel and check columns
    // For demo, randomly show validation errors
    const hasValidationError = Math.random() > 0.5;
    if (hasValidationError) {
      setValidationErrors([
        'GSTIN, Invoice Number, and Date are mandatory fields. Ensure date format is DD-MM-YYYY.',
      ]);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const removeFile = useCallback(() => {
    setFile(null);
    setFileTypeError(null);
    setValidationErrors([]);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const resetWizard = useCallback(() => {
    setStep(1);
    setFile(null);
    setFileTypeError(null);
    setValidationErrors([]);
    setIsMatching(false);
    setMatchProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const startMatching = useCallback(() => {
    setIsMatching(true);
  }, []);

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
          {file?.rows.toLocaleString() ?? '4,502'} records with the official GST
          database. This ensures your E-invoice and E-way bill data is perfectly
          aligned.
        </p>

        <div className={styles.progressBarSection}>
          <div className={styles.progressBarHeader}>
            <span className={styles.progressLabel}>Progress</span>
            <span className={styles.progressPercent}>{matchProgress}%</span>
          </div>
          <div className={styles.progressBarTrack}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${matchProgress}%` }}
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

      <div
        className={`${styles.dropzone} ${dragOver ? styles.dropzoneDragOver : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
      >
        <div className={styles.dropzoneIcon}>⬆</div>
        <p className={styles.dropzoneTitle}>Drag and drop your Excel file here</p>
        <p className={styles.dropzoneHint}>
          Supported formats: .xlsx, .xls (Max 25MB)
          <br />
          Ensure all sheets follow the template structure.
        </p>
        <button
          type="button"
          className={styles.uploadBtn}
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          Click to Upload
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className={styles.hiddenInput}
          onChange={onFileChange}
        />
      </div>

      {/* File type error */}
      {fileTypeError && (
        <div className={styles.fileTypeError}>
          <div className={styles.fileTypeErrorIcon}>
            <AlertTriangleIcon className={styles.fileTypeErrorIconSvg} />
          </div>
          <div className={styles.fileTypeErrorContent}>
            <p className={styles.fileTypeErrorTitle}>Invalid File Format</p>
            <p className={styles.fileTypeErrorMessage}>{fileTypeError}</p>
          </div>
        </div>
      )}

      {/* Uploaded file card */}
      {file && (
        <div className={styles.fileCard}>
          <div className={styles.fileIcon}>
            <FileIcon />
          </div>
          <div className={styles.fileInfo}>
            <p className={styles.fileName}>
              {file.name}
              <span className={styles.fileBadge}>
                {validationErrors.length > 0 ? 'Has errors' : 'Ready for validation'}
              </span>
            </p>
            <p className={styles.fileMeta}>
              {formatFileSize(file.size)} • {file.rows.toLocaleString()} rows detected • Uploaded successfully
            </p>
          </div>
          <button
            type="button"
            className={styles.fileRemove}
            onClick={removeFile}
            aria-label="Remove file"
          >
            ✕
          </button>
        </div>
      )}

      {/* Validation error card */}
      {validationErrors.length > 0 && (
        <div className={styles.validationError}>
          <div className={styles.validationErrorIcon}>
            <InfoCircleIcon className={styles.validationErrorIconSvg} />
          </div>
          <div className={styles.validationErrorContent}>
            <p className={styles.validationErrorTitle}>Validation Error</p>
            {validationErrors.map((err) => (
              <p key={err} className={styles.validationErrorMessage}>{err}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  /* ── Step 2: Match & Confirm ── */
  const [activeTab, setActiveTab] = useState<string>('Basic');

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
            <p className={styles.matchStatValue}>4,450</p>
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
            <p className={styles.matchStatValue}>32</p>
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
            <p className={styles.matchStatValue}>20</p>
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

        {/* Tabs */}
        <div className={styles.draftTabs}>
          {DRAFT_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`${styles.draftTab} ${activeTab === tab ? styles.draftTabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {DRAFT_TAB_BADGES[tab] != null && (
                <span className={styles.draftTabBadge}>{DRAFT_TAB_BADGES[tab]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className={styles.draftTableWrap}>
          <div className={styles.draftFilingPeriod}>
            <span className={styles.filingPeriodLabel}>FILING PERIOD</span>
            <span className={styles.filingPeriodYear}>2023{"\n"}-24</span>
            <span className={styles.filingPeriodMonth}>October</span>
            <span className={styles.filingPeriodSync}>
              <span className={styles.syncIcon}>ⓘ</span>
              Data synced from GST Portal
            </span>
          </div>

          <table className={styles.draftTable}>
            <thead>
              <tr>
                <th className={styles.draftThSr}>SR.</th>
                <th>PARTICULARS</th>
                <th>DETAILS / VALUES</th>
              </tr>
            </thead>
            <tbody>
              {DRAFT_ROWS.map((row) => (
                <tr key={row.sr}>
                  <td className={styles.draftTdSr}>{row.sr}</td>
                  <td>
                    <span className={styles.draftParticularsLabel}>{row.label}</span>
                    <span className={styles.draftParticularsSub}>{row.sub}</span>
                  </td>
                  <td>
                    {row.highlight ? (
                      <span className={styles.draftValueHighlight}>{row.value}</span>
                    ) : (
                      <span className={styles.draftValue}>{row.value}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
          onClick={() => setStep(3)}
        >
          Confirm & Proceed to Filing →
        </button>
      </div>
    </>
  );

  /* ── Step 3: Success ── */
  const renderSuccess = () => (
    <div className={styles.card}>
      <div className={styles.success}>
        <div className={styles.successIcon}>✓</div>
        <h3 className={styles.successTitle}>GSTR-1 Filed Successfully!</h3>
        <p className={styles.successSubtitle}>
          Your GSTR-1 return for the current period has been submitted successfully.
          <br />
          You will receive a confirmation on your registered email.
        </p>

        <div className={styles.successDetails}>
          <p className={styles.successDetail}>
            <span className={styles.successDetailLabel}>ARN: </span>
            AA270626001234Z
          </p>
          <p className={styles.successDetail}>
            <span className={styles.successDetailLabel}>Date: </span>
            {new Date().toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
          <p className={styles.successDetail}>
            <span className={styles.successDetailLabel}>Invoices: </span>
            {file?.rows.toLocaleString() ?? '4,502'} processed
          </p>
        </div>

        <div className={styles.successActions}>
          <Link to={ROUTES.dashboard.root} className={styles.dashboardBtn}>
            ← Back to Dashboard
          </Link>
          <button type="button" className={styles.newFilingBtn} onClick={resetWizard}>
            New Filing
          </button>
        </div>
      </div>
    </div>
  );

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

      {step === 1 && !isMatching && (
        <>
          {renderUpload()}
          <button
            type="button"
            className={styles.proceedBtn}
            disabled={!file || validationErrors.length > 0}
            onClick={startMatching}
          >
            Proceed to Matching →
          </button>
        </>
      )}

      {step === 1 && isMatching && renderMatchingProgress()}

      {step === 2 && !isMatching && renderMatching()}
      {step === 3 && renderSuccess()}
    </div>
  );
}
