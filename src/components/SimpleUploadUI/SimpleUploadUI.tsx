import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePeriod } from '@/context/PeriodContext';
import styles from './SimpleUploadUI.module.css';

interface SimpleUploadUIProps {
  title: string;
  subtitle: string;
  onUpload: (file: File, year: string, month: string) => void | Promise<void>;
  onSync: () => void | Promise<void>;
  /** True while the lookup for the selected period's stored data is in flight. */
  loadingExistingData?: boolean;
  /** True when the selected period already has uploaded or synced data to show. */
  hasExistingData?: boolean;
  /** One-line description of what is already stored, e.g. "142 bills · Synced 21 Aug 2026". */
  existingSummary?: string;
  /** Table (or any view) of the stored rows, shown in place of the dropzone. */
  existingData?: ReactNode;
  /** Why the stored-data lookup failed. Shown so a broken route is not mistaken for an empty period. */
  existingError?: string | null;
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SimpleUploadUI({
  title,
  subtitle,
  onUpload,
  onSync,
  loadingExistingData = false,
  hasExistingData = false,
  existingSummary,
  existingData,
  existingError = null,
}: SimpleUploadUIProps) {
  const { selectedYear, selectedMonth, periodLabel } = usePeriod();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  /** Set when the user opts to replace data that already exists for this period. */
  const [replacing, setReplacing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // A file staged for one period must not carry over to the next, and the newly
  // selected period should open on its own stored data rather than mid-replace.
  useEffect(() => {
    setSelectedFile(null);
    setReplacing(false);
  }, [selectedYear.label, selectedMonth]);

  const handleFile = useCallback(
    (f: File) => {
      setSelectedFile(f);
    },
    []
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
      // Reset so re-picking the same file still fires a change event.
      e.target.value = '';
    },
    [handleFile]
  );

  const handleUploadClick = async () => {
    if (!selectedFile) return;
    await onUpload(selectedFile, selectedYear.label, selectedMonth);
    setSelectedFile(null);
    setReplacing(false);
  };

  const showStoredData = hasExistingData && !replacing;

  return (
    <div className={styles.page}>
      <h2 className={styles.pageTitle}>{title}</h2>
      <p className={styles.pageSubtitle}>{subtitle}</p>

      {existingError && !loadingExistingData && (
        <div className={styles.errorBanner} role="alert">
          <strong className={styles.errorTitle}>Could not load existing data for {periodLabel}</strong>
          <span className={styles.errorDetail}>{existingError}</span>
        </div>
      )}

      {loadingExistingData && (
        <div className={styles.card}>
          <p className={styles.checkingState}>Checking {periodLabel} for existing data…</p>
        </div>
      )}

      {!loadingExistingData && showStoredData && (
        <div className={styles.card}>
          <div className={styles.uploadHeader}>
            <div>
              <h3 className={styles.uploadTitle}>
                <span className={styles.storedDot} aria-hidden="true" />
                Data already available for {periodLabel}
              </h3>
              <p className={styles.uploadSubtitle}>
                {existingSummary ?? 'This period already has uploaded or synced data.'}
              </p>
            </div>
            <div className={styles.headerActions}>
              <button type="button" className={styles.smallButton} onClick={() => onSync()}>
                Re-sync
              </button>
              <button
                type="button"
                className={`${styles.smallButton} ${styles.smallButtonPrimary}`}
                onClick={() => setReplacing(true)}
              >
                Upload new file
              </button>
            </div>
          </div>

          {existingData}
        </div>
      )}

      {!loadingExistingData && !showStoredData && (
        <div className={styles.card}>
          <div className={styles.uploadHeader}>
            <div>
              <h3 className={styles.uploadTitle}>Upload File</h3>
              <p className={styles.uploadSubtitle}>
                {hasExistingData
                  ? `Uploading replaces the data currently stored for ${periodLabel}.`
                  : 'Select or drop an Excel file to upload.'}
              </p>
            </div>
            {hasExistingData && (
              <div className={styles.headerActions}>
                <button type="button" className={styles.smallButton} onClick={() => setReplacing(false)}>
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div
            className={`${styles.dropzone} ${dragOver ? styles.dropzoneDragOver : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { setDragOver(false); onDrop(e); }}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
          >
            <div className={styles.dropzoneIcon}><UploadIcon /></div>
            <p className={styles.dropzoneTitle}>Drag and drop your Excel file here</p>
            <p className={styles.dropzoneHint}>Supported formats: .xlsx, .xls · Max 100 MB</p>
            <button type="button" className={styles.uploadBtn} onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
              Click to Browse
            </button>
            <input ref={inputRef} type="file" accept=".xlsx,.xls" className={styles.hiddenInput} onChange={onFileChange} />
          </div>

          {selectedFile && (
            <div className={styles.fileCard}>
              <div className={styles.fileIcon}><FileIcon /></div>
              <div className={styles.fileInfo}>
                <p className={styles.fileName}>{selectedFile.name}</p>
                <p className={styles.fileMeta}>{formatFileSize(selectedFile.size)}</p>
              </div>
              <button type="button" className={styles.fileRemove} onClick={() => setSelectedFile(null)} aria-label="Remove file">✕</button>
            </div>
          )}

          <div className={styles.actionsRow}>
            <button
              type="button"
              className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
              onClick={() => onSync()}
            >
              Sync
            </button>
            <button
              type="button"
              className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
              onClick={handleUploadClick}
              disabled={!selectedFile}
            >
              Upload
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
