import { useCallback, useState } from 'react';
import { describeApiError } from '@/lib/api-error';
import { downloadTemplate, TEMPLATE_LABELS, type TemplateKey } from '@/lib/templates.api';
import styles from './DownloadTemplateButton.module.css';

interface DownloadTemplateButtonProps {
  /** Which blank Excel template to fetch, e.g. 'gstr1'. */
  templateKey: TemplateKey;
  /** Button text. Defaults to "Download Template". */
  label?: string;
  /** Pass a page's own button class to keep the page's existing look. */
  className?: string;
}

function DownloadIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 3v12m0 0l-4-4m4 4l4-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Downloads a blank Excel template from the backend. The template routes require a
 * Bearer token, so the file is fetched as a blob and saved client-side — a plain
 * <a href> would come back 401.
 */
export function DownloadTemplateButton({
  templateKey,
  label = 'Download Template',
  className,
}: DownloadTemplateButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = useCallback(async () => {
    setDownloading(true);
    setError(null);

    try {
      await downloadTemplate(templateKey);
    } catch (err) {
      setError(describeApiError(err));
    } finally {
      setDownloading(false);
    }
  }, [templateKey]);

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={className ?? styles.button}
        onClick={handleClick}
        disabled={downloading}
        title={`Download the ${TEMPLATE_LABELS[templateKey]}`}
      >
        <DownloadIcon />
        {downloading ? 'Downloading…' : label}
      </button>

      {error && (
        <span className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
