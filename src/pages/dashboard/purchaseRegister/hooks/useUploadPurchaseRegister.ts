import { useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  purchaseRegisterApi,
  type PurchaseRegisterUploadResponse,
} from '@/pages/dashboard/purchaseRegister/api/purchaseRegisterApi';
import { handleApiError } from '@/services/api';

const ALLOWED_EXTENSIONS = ['.xlsx', '.xls'];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

function isExcelFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export interface PurchaseRegisterUploadResult {
  fileName: string;
  fileSize: number;
  rows: number;
  filingId: number;
  validationErrors: string[];
}

type UseUploadPurchaseRegisterReturn = {
  mutate: (file: File, companyGstId: number, financialYear: string, taxPeriod: string) => void;
  reset: () => void;
  data: PurchaseRegisterUploadResult | null;
  isPending: boolean;
  isError: boolean;
  error: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

export function useUploadPurchaseRegister(): UseUploadPurchaseRegisterReturn {
  const [data, setData] = useState<PurchaseRegisterUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsPending(false);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const mutate = useCallback(
    async (
      file: File,
      companyGstId: number,
      financialYear: string,
      taxPeriod: string,
    ) => {
      setError(null);
      setData(null);

      if (!isExcelFile(file)) {
        setError(
          `"${file.name}" is not a supported format. Please upload an Excel file (.xlsx or .xls).`,
        );
        if (inputRef.current) inputRef.current.value = '';
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`File exceeds the 100 MB limit. Please upload a smaller file.`);
        if (inputRef.current) inputRef.current.value = '';
        return;
      }

      setIsPending(true);
      try {
        const response: PurchaseRegisterUploadResponse = await purchaseRegisterApi.upload(
          file,
          companyGstId,
          financialYear,
          taxPeriod.toUpperCase(),
        );
        setData({
          fileName: file.name,
          fileSize: file.size,
          rows: response.totalRowsImported,
          filingId: response.filingId,
          validationErrors: [],
        });

        // Invalidate the cache so the GSTR-3B page will fetch the latest filings
        queryClient.invalidateQueries({ queryKey: ['pr-filings'] });
      } catch (err) {
        const apiError = handleApiError(err);
        const msg = apiError.message ?? '';

        // ── Translate common backend SQL errors into friendly messages ──
        let friendlyError: string;

        if (msg.includes('Data too long for column')) {
          // Extract column name from: "Data too long for column 'pre_gst' at row 1"
          const colMatch = msg.match(/Data too long for column '([^']+)'/);
          const colName = colMatch ? `"${colMatch[1]}"` : 'a column';
          const tableMatch = msg.match(/insert into (\w+)/);
          const sheet = tableMatch ? tableMatch[1].replace('gstr2_', '').toUpperCase() : '';
          friendlyError = `Data too long for ${colName}${sheet ? ` in the ${sheet} sheet` : ''}. Please check that all fields in your Excel file are within the expected character limits.`;
        } else if (msg.includes('Duplicate entry')) {
          friendlyError = 'This file appears to have already been uploaded for this period. Please check your existing filings.';
        } else if (msg.includes('could not execute statement')) {
          friendlyError = 'The server could not save the data. This is usually caused by an unexpected value in your Excel file. Please verify the file format matches the GSTR-2 template.';
        } else {
          friendlyError = `Upload failed: ${msg}. Please try again.`;
        }

        setError(friendlyError);
        if (inputRef.current) inputRef.current.value = '';
      } finally {
        setIsPending(false);
      }
    },
    [queryClient],
  );

  return { mutate, reset, data, isPending, isError: error !== null, error, inputRef };
}
