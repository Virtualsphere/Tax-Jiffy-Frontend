import styles from './ExistingFilingNotice.module.css';

export type ExistingFilingNoticeProps = {
  /** Name of the file that was uploaded for this period, if the server kept it. */
  fileName?: string;
  /** Human-readable period, e.g. "August 2025-26". */
  periodLabel: string;
  /** ISO date string from the filing record. */
  uploadedOn?: string;
  filingId: number;
  /** Backend filing status, e.g. "DRAFT" or "FILED". */
  status?: string;
  /** Row count, when the caller knows it. */
  rows?: number;
  /** Continue into the already-parsed data. */
  onContinue?: () => void;
  continueLabel?: string;
  /** Open the file picker to upload a replacement for this period. */
  onReplace?: () => void;
  /** Disables both actions while an upload is in flight. */
  busy?: boolean;
};

function FileIcon() {
  return (
    <svg className={styles.iconSvg} viewBox="0 0 24 24" fill="none" aria-hidden>
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

function formatDate(value?: string): string | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return null;
  return new Date(parsed).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Shown in place of an empty dropzone when a file has already been uploaded for
 * the selected period. Without this the upload screen looks untouched after a
 * refresh, and the user re-uploads a period that is already on the server.
 */
export function ExistingFilingNotice({
  fileName,
  periodLabel,
  uploadedOn,
  filingId,
  status,
  rows,
  onContinue,
  continueLabel = 'Continue to review',
  onReplace,
  busy = false,
}: ExistingFilingNoticeProps) {
  const uploadedDate = formatDate(uploadedOn);
  const isFiled = status?.toUpperCase() === 'FILED';

  const meta = [
    uploadedDate ? `Uploaded ${uploadedDate}` : null,
    typeof rows === 'number' && rows > 0 ? `${rows.toLocaleString()} records` : null,
    `Filing ID: ${filingId}`,
  ].filter(Boolean);

  return (
    <div className={styles.notice}>
      <div className={styles.icon}>
        <FileIcon />
      </div>

      <div className={styles.info}>
        <p className={styles.title}>
          A file is already uploaded for {periodLabel}
          {status && (
            <span className={`${styles.badge} ${isFiled ? styles.badgeFiled : styles.badgeDraft}`}>
              {status}
            </span>
          )}
        </p>
        {fileName && <p className={styles.fileName}>{fileName}</p>}
        <p className={styles.meta}>{meta.join(' • ')}</p>
      </div>

      <div className={styles.actions}>
        {onContinue && (
          <button type="button" className={styles.primaryBtn} onClick={onContinue} disabled={busy}>
            {continueLabel}
          </button>
        )}
        {onReplace && (
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={onReplace}
            disabled={busy || isFiled}
            title={isFiled ? 'This period has already been filed and cannot be replaced.' : undefined}
          >
            Replace file
          </button>
        )}
      </div>
    </div>
  );
}
