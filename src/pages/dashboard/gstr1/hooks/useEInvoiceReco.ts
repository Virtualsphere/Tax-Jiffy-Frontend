import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { einvoiceRecoApi } from '../api/einvoiceReco.api';
import type { MatchStatus } from '../types/einvoice-reco.types';

export const RECO_QUERY_KEYS = {
  all: ['einvoiceReco'] as const,
  saleRegister: (filingId: number) => [...RECO_QUERY_KEYS.all, filingId, 'sale-register'] as const,
  einvoices: (filingId: number) => [...RECO_QUERY_KEYS.all, filingId, 'einvoices'] as const,
  result: (filingId: number, status?: MatchStatus | 'ALL') => 
    [...RECO_QUERY_KEYS.all, filingId, 'result', status] as const,
  unlinked: (filingId: number) => [...RECO_QUERY_KEYS.all, filingId, 'unlinked'] as const,
};

export function useEInvoiceRecoSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (filingId: number) => einvoiceRecoApi.syncEInvoiceReco(filingId),
    onSuccess: (_, filingId) => {
      // Invalidate all reco queries for this filingId to trigger refetch
      queryClient.invalidateQueries({
        queryKey: [...RECO_QUERY_KEYS.all, filingId],
      });
    },
  });
}

export function useSaleRegisterQuery(filingId?: number) {
  return useQuery({
    queryKey: RECO_QUERY_KEYS.saleRegister(filingId!),
    queryFn: () => einvoiceRecoApi.getSaleRegister(filingId!),
    enabled: !!filingId,
  });
}

export function useEInvoicesQuery(filingId?: number) {
  return useQuery({
    queryKey: RECO_QUERY_KEYS.einvoices(filingId!),
    queryFn: () => einvoiceRecoApi.getEInvoices(filingId!),
    enabled: !!filingId,
  });
}

export function useReconciliationResultQuery(filingId?: number, matchStatus?: MatchStatus | 'ALL') {
  return useQuery({
    queryKey: RECO_QUERY_KEYS.result(filingId!, matchStatus),
    queryFn: () => {
      const statusParam = matchStatus === 'ALL' ? undefined : (matchStatus as MatchStatus);
      return einvoiceRecoApi.getReconciliationResult(filingId!, statusParam);
    },
    enabled: !!filingId,
  });
}

export function useUnlinkedQuery(filingId?: number) {
  return useQuery({
    queryKey: RECO_QUERY_KEYS.unlinked(filingId!),
    queryFn: () => einvoiceRecoApi.getUnlinked(filingId!),
    enabled: !!filingId,
  });
}
