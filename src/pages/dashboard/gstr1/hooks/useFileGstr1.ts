import { useCallback, useState } from 'react';
import { MOCK_FILING_ARN } from '@/pages/dashboard/gstr1/data/gstr1.mock';
import type { Gstr1FilingResult } from '@/pages/dashboard/gstr1/types/gstr1.types';

// TODO: Replace with useMutation(() => gstr1Api.file(data))
// when the backend endpoint POST /gstr1/file is available.

type UseFileGstr1Return = {
  /** Submit the filing */
  mutate: (invoicesProcessed: number) => void;
  /** Filing result with ARN, date, invoice count */
  data: Gstr1FilingResult | null;
  /** Whether filing submission is in progress */
  isPending: boolean;
  /** Whether an error occurred during filing */
  isError: boolean;
  /** Error message if any */
  error: string | null;
  /** Reset filing state */
  reset: () => void;
};

export function useFileGstr1(): UseFileGstr1Return {
  const [data, setData] = useState<Gstr1FilingResult | null>(null);

  const mutate = useCallback((invoicesProcessed: number) => {
    // TODO: Replace with actual API call — POST /gstr1/file
    setData({
      arn: MOCK_FILING_ARN,
      date: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      invoicesProcessed,
    });
  }, []);

  const reset = useCallback(() => {
    setData(null);
  }, []);

  return {
    mutate,
    data,
    isPending: false, // TODO: will be true during actual submission
    isError: false,
    error: null,
    reset,
  };
}
