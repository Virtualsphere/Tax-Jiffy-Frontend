import { useCallback, useRef, useState } from 'react';
import type { Gstr1UploadResult } from '@/pages/dashboard/gstr1/types/gstr1.types';
import { gstr1Api } from '@/pages/dashboard/gstr1/api/gstr1.api';
import { handleApiError } from '@/services/api';

const ALLOWED_EXTENSIONS = ['.xlsx', '.xls'];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

function isExcelFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

type UseUploadSalesRegisterReturn = {
  /** Process a selected file — uploads directly to backend */
  mutate: (file: File, companyGstId: number, financialYear: string, taxPeriod: string) => void;
  /** Reset upload state */
  reset: () => void;
  /** The parsed upload result, or null if nothing uploaded */
  data: Gstr1UploadResult | null;
  /** Whether the upload is in progress */
  isPending: boolean;
  /** Whether an error occurred */
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

  const mutate = useCallback(async (
    file: File,
    companyGstId: number,
    financialYear: string,
    taxPeriod: string
  ) => {
    setError(null);
    setData(null);

    // 1. Client-side file type validation
    if (!isExcelFile(file)) {
      setError(
        `"${file.name}" is not a supported file format. Please upload an Excel file (.xlsx or .xls).`,
      );
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    // 2. Client-side file size validation
    if (file.size > MAX_FILE_SIZE) {
      setError(
        `File size (${formatFileSize(file.size)}) exceeds the 100MB limit. Please upload a smaller file.`,
      );
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setIsPending(true);
    try {
      // 3. Upload directly to the backend
      const uploadResponse = await gstr1Api.upload(
        file,
        companyGstId,
        financialYear,
        taxPeriod.toUpperCase() // Spring Boot expects uppercase month (e.g. "JUNE")
      );

      setData({
        fileName: file.name,
        fileSize: file.size,
        rows: uploadResponse.totalRowsImported,
        validationErrors: [],
        filingId: uploadResponse.filingId,
      });
    } catch (err) {
      const apiError = handleApiError(err);
      setError(`Upload failed: ${apiError.message}. Please try again.`);
      if (inputRef.current) inputRef.current.value = '';
    } finally {
      setIsPending(false);
    }
  }, []);

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
