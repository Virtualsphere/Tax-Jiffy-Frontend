import { useCallback, useRef, useState } from 'react';
import type { Gstr1UploadResult } from '@/pages/dashboard/gstr1/types/gstr1.types';
import { parseGstr1Excel } from '@/pages/dashboard/gstr1/data/parseGstr1Excel';

// TODO: Replace with useMutation(() => gstr1Api.upload(file))
// when the backend endpoint POST /gstr1/upload is available.
// The server should parse the Excel, validate columns, and return row count + errors.

const ALLOWED_EXTENSIONS = ['.xlsx', '.xls'];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

function isExcelFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

type UseUploadSalesRegisterReturn = {
  /** Process a selected file (client-side Excel parsing) */
  mutate: (file: File) => void;
  /** Reset upload state */
  reset: () => void;
  /** The parsed upload result, or null if nothing uploaded */
  data: Gstr1UploadResult | null;
  /** Whether the upload is in progress */
  isPending: boolean;
  /** Whether an error occurred (file type / size) */
  isError: boolean;
  /** Human-readable error message */
  error: string | null;
  /** Ref for the hidden file input */
  inputRef: React.RefObject<HTMLInputElement | null>;
};

export function useUploadSalesRegister(): UseUploadSalesRegisterReturn {
  const [data, setData] = useState<Gstr1UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsPending(false);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const mutate = useCallback(
    async (file: File) => {
      // Reset previous state
      setError(null);
      setData(null);

      // Validate file type
      if (!isExcelFile(file)) {
        setError(
          `"${file.name}" is not a supported file format. Please upload an Excel file (.xlsx or .xls).`,
        );
        if (inputRef.current) inputRef.current.value = '';
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setError(
          `File size (${formatFileSize(file.size)}) exceeds the 25MB limit. Please upload a smaller file.`,
        );
        if (inputRef.current) inputRef.current.value = '';
        return;
      }

      // Parse the Excel file client-side
      setIsPending(true);
      try {
        const { draftData, rowCount } = await parseGstr1Excel(file);

        // Basic validation: check that the workbook has the expected GSTR-1 sheets
        const validationErrors: string[] = [];
        const hasGstr1Sheets = draftData.outwardData !== undefined || draftData.othersData !== undefined;
        if (!hasGstr1Sheets) {
          validationErrors.push(
            'This workbook does not appear to be a GSTR-1 template. Expected sheets (b2b, hsn, docs, etc.) were not found.',
          );
        }

        setData({
          fileName: file.name,
          fileSize: file.size,
          rows: rowCount,
          validationErrors,
          parsedDraftData: draftData,
        });
      } catch (err) {
        setError(
          `Failed to parse the Excel file: ${err instanceof Error ? err.message : 'Unknown error'}. Please ensure it is a valid GSTR-1 template.`,
        );
        if (inputRef.current) inputRef.current.value = '';
      } finally {
        setIsPending(false);
      }
    },
    [],
  );

  return {
    mutate,
    reset,
    data,
    isPending,
    isError: error !== null,
    error,
    inputRef,
  };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
