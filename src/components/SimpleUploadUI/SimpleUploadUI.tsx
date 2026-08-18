import { useCallback, useRef, useState } from 'react';
import { usePeriod } from '@/context/PeriodContext';
import styles from './SimpleUploadUI.module.css';

interface SimpleUploadUIProps {
  title: string;
  subtitle: string;
  onUpload: (file: File, year: string, month: string) => void;
  onSync: () => void;
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

export function SimpleUploadUI({ title, subtitle, onUpload, onSync }: SimpleUploadUIProps) {
  const { selectedYear, selectedMonth } = usePeriod();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    },
    [handleFile]
  );

  const handleUploadClick = () => {
    if (selectedFile) {
      onUpload(selectedFile, selectedYear.label, selectedMonth);
    }
  };

  return (
    <div className={styles.page}>
      <h2 className={styles.pageTitle}>{title}</h2>
      <p className={styles.pageSubtitle}>{subtitle}</p>

      <div className={styles.card}>
        <div className={styles.uploadHeader}>
          <div>
            <h3 className={styles.uploadTitle}>Upload File</h3>
            <p className={styles.uploadSubtitle}>
              Select or drop an Excel file to upload.
            </p>
          </div>
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
            onClick={onSync}
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
    </div>
  );
}
