import { useMutation, useQuery } from '@tanstack/react-query';
import { gstr1Api } from '@/pages/dashboard/gstr1/api/gstr1.api';
import type { Gstr1SubmitRequest } from '@/pages/dashboard/gstr1/types/gstr1-api.types';

/**
 * Fetches the final GSTR-1 payload preview.
 * Only enabled when `filingId` is provided and `enabled` is true.
 */
export function useGstr1SubmitPayload(
  filingId: number | undefined,
  grossTurnover: number,
  currentGrossTurnover: number,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ['gstr1-submit-payload', filingId, grossTurnover, currentGrossTurnover],
    queryFn: () => gstr1Api.getSubmitPayload(filingId!, grossTurnover, currentGrossTurnover),
    enabled: !!filingId && enabled,
    staleTime: 0,
  });
}

/**
 * Mutation hook to submit the GSTR-1 return to the GST portal.
 * On success, returns the ARN.
 */
export function useSubmitGstr1(filingId: number | undefined) {
  return useMutation({
    mutationFn: (body: Gstr1SubmitRequest) => {
      if (!filingId) throw new Error('No filing ID available for submission');
      return gstr1Api.submit(filingId, body);
    },
  });
}
