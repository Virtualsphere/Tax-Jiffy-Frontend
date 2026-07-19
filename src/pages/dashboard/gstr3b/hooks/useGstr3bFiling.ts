import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  gstr3bApi,
  type Gstr3bFiling,
  type Gstr3bFilingLinkRequest,
  type Gstr3bInterestLateFeeRequest,
  type ImsCredentials,
  type TwoBCredentials,
  type Gstr3bPreviewResponse,
} from '@/pages/dashboard/gstr3b/api/gstr3bApi';
import { handleApiError } from '@/services/api';

/** Manage the GSTR-3B filing for a given company GST and period */
export function useGstr3bFiling(companyGstId: number | null | undefined) {
  const filingsQuery = useQuery({
    queryKey: ['gstr3b-filings', companyGstId],
    queryFn: () => gstr3bApi.getFilingsByCompanyGst(companyGstId!),
    enabled: !!companyGstId,
  });

  return {
    filings: filingsQuery.data ?? [],
    isLoading: filingsQuery.isLoading,
    refetch: filingsQuery.refetch,
  };
}

/** Create or fetch a GSTR-3B filing for a specific period */
export function useCreateOrLinkGstr3b() {
  const [filing, setFiling] = useState<Gstr3bFiling | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrLink = useCallback(async (req: Gstr3bFilingLinkRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await gstr3bApi.createOrLinkFiling(req);
      setFiling(result);
      return result;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { filing, setFiling, createOrLink, isLoading, error };
}

/** Fetch the GSTR-3B preview (tables 3.1 – 6.1) */
export function useGstr3bPreview(filingId: number | null | undefined) {
  return useQuery({
    queryKey: ['gstr3b-preview', filingId],
    queryFn: () => gstr3bApi.getPreview(filingId!),
    enabled: !!filingId,
  });
}

/** Sync IMS invoices */
export function useSyncIms() {
  const [result, setResult] = useState<{ rowsSynced: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sync = useCallback(async (filingId: number, credentials: ImsCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const r = await gstr3bApi.syncIms(filingId, credentials);
      setResult(r);
      return r;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { sync, result, isLoading, error };
}

/** Sync GSTR-2B ITC */
export function useSync2b() {
  const [result, setResult] = useState<{ rowsSynced: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sync = useCallback(async (filingId: number, credentials: TwoBCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const r = await gstr3bApi.sync2b(filingId, credentials);
      setResult(r);
      return r;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { sync, result, isLoading, error };
}

/** Save interest & late fee for table 5.1 */
export function useUpdateInterestLateFee() {
  return useMutation({
    mutationFn: ({
      filingId,
      req,
    }: {
      filingId: number;
      req: Gstr3bInterestLateFeeRequest;
    }) => gstr3bApi.updateInterestLateFee(filingId, req),
  });
}
