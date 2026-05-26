import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useUploadSalesRegister } from '@/pages/dashboard/gstr1/hooks/useUploadSalesRegister';
import { useGstr1Match } from '@/pages/dashboard/gstr1/hooks/useGstr1Match';
import { useGstr1Draft } from '@/pages/dashboard/gstr1/hooks/useGstr1Draft';
import { useFileGstr1 } from '@/pages/dashboard/gstr1/hooks/useFileGstr1';
import styles from '@/pages/dashboard/gstr1/GSTR1Page.module.css';

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

  // Hooks — all mock data lives inside these; swap internals for real API later
  const upload = useUploadSalesRegister();
  const match = useGstr1Match();
  const draft = useGstr1Draft();
  const filing = useFileGstr1();

  const [activeTab, setActiveTab] = useState<string>('Basic');

  // When matching completes, move to step 2
  const handleStartMatching = useCallback(() => {
    match.startMatching();
  }, [match]);

  // Check if matching just completed and we need to advance
  if (match.isComplete && step === 1) {
    setStep(2);
  }

  const handleConfirmFiling = useCallback(() => {
    filing.mutate(upload.data?.rows ?? 4502);
    setStep(3);
  }, [filing, upload.data?.rows]);

  const resetWizard = useCallback(() => {
    setStep(1);
    upload.reset();
    match.reset();
    filing.reset();
    setActiveTab('Basic');
  }, [upload, match, filing]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) upload.mutate(f);
    },
    [upload],
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) upload.mutate(f);
    },
    [upload],
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
          Supported formats: .xlsx, .xls (Max 25MB)
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

      {/* Uploaded file card */}
      {upload.data && (
        <div className={styles.fileCard}>
          <div className={styles.fileIcon}>
            <FileIcon />
          </div>
          <div className={styles.fileInfo}>
            <p className={styles.fileName}>
              {upload.data.fileName}
              <span className={styles.fileBadge}>
                {upload.data.validationErrors.length > 0 ? 'Has errors' : 'Ready for validation'}
              </span>
            </p>
            <p className={styles.fileMeta}>
              {formatFileSize(upload.data.fileSize)} • {upload.data.rows.toLocaleString()} rows detected • Uploaded successfully
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

        {/* Table */}
        <div className={styles.draftTableWrap}>
          <div className={styles.draftFilingPeriod}>
            <span className={styles.filingPeriodLabel}>FILING PERIOD</span>
            <span className={styles.filingPeriodYear}>{draft.data.filingPeriodYear}</span>
            <span className={styles.filingPeriodMonth}>{draft.data.filingPeriodMonth}</span>
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
              {draft.data.rows.map((row) => (
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
          onClick={handleConfirmFiling}
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
            {filing.data?.arn ?? '—'}
          </p>
          <p className={styles.successDetail}>
            <span className={styles.successDetailLabel}>Date: </span>
            {filing.data?.date ?? '—'}
          </p>
          <p className={styles.successDetail}>
            <span className={styles.successDetailLabel}>Invoices: </span>
            {filing.data?.invoicesProcessed.toLocaleString() ?? '—'} processed
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

      {step === 1 && !match.isMatching && (
        <>
          {renderUpload()}
          <button
            type="button"
            className={styles.proceedBtn}
            disabled={!upload.data || upload.data.validationErrors.length > 0}
            onClick={handleStartMatching}
          >
            Proceed to Matching →
          </button>
        </>
      )}

      {step === 1 && match.isMatching && renderMatchingProgress()}

      {step === 2 && !match.isMatching && renderMatching()}
      {step === 3 && renderSuccess()}
    </div>
  );
}
