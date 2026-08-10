import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ewaybillRecoApi } from '../api/ewaybillReco.api';
import type { EwbMatchStatus } from '../types/ewaybill-reco.types';

export const EWB_RECO_QUERY_KEYS = {
  all: ['ewaybillReco'] as const,
  result: (filingId: number, status?: EwbMatchStatus | 'ALL') =>
    [...EWB_RECO_QUERY_KEYS.all, filingId, 'result', status] as const,
  unlinked: (filingId: number) => [...EWB_RECO_QUERY_KEYS.all, filingId, 'unlinked'] as const,
};

export function useEwaybillRecoSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (filingId: number) => ewaybillRecoApi.reconcile(filingId),
    onSuccess: (_, filingId) => {
      queryClient.invalidateQueries({
        queryKey: [...EWB_RECO_QUERY_KEYS.all, filingId],
      });
    },
  });
}

export function useEwaybillReconciliationResultQuery(filingId?: number, matchStatus?: EwbMatchStatus | 'ALL') {
  return useQuery({
    queryKey: EWB_RECO_QUERY_KEYS.result(filingId!, matchStatus),
    queryFn: () => {
      const statusParam = matchStatus === 'ALL' ? undefined : (matchStatus as EwbMatchStatus);
      return ewaybillRecoApi.getReconciliationResult(filingId!, statusParam);
    },
    enabled: !!filingId,
  });
}

export function useEwaybillUnlinkedQuery(filingId?: number) {
  return useQuery({
    queryKey: EWB_RECO_QUERY_KEYS.unlinked(filingId!),
    queryFn: () => ewaybillRecoApi.getUnlinked(filingId!),
    enabled: !!filingId,
  });
}
