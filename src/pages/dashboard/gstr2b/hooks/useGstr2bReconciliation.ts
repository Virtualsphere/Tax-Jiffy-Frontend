import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gstr2bApi } from '../api/gstr2b.api';
import type { Gstr2bInvoiceUpdateRequest } from '../types/gstr2b-filing.types';

export const GSTR2B_RECO_QUERY_KEYS = {
  all: ['gstr2bReco'] as const,
  reconciliation: (filingId: number) => [...GSTR2B_RECO_QUERY_KEYS.all, filingId, 'reconciliation'] as const,
};

export function useGstr2bReconciliationQuery(filingId?: number) {
  return useQuery({
    queryKey: GSTR2B_RECO_QUERY_KEYS.reconciliation(filingId!),
    queryFn: () => gstr2bApi.getReconciliation(filingId!),
    enabled: !!filingId,
  });
}

export function useUpdateGstr2bInvoice(filingId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, patch }: { invoiceId: number; patch: Gstr2bInvoiceUpdateRequest }) =>
      gstr2bApi.updateInvoice(invoiceId, patch),
    onSuccess: () => {
      if (filingId) queryClient.invalidateQueries({ queryKey: GSTR2B_RECO_QUERY_KEYS.reconciliation(filingId) });
    },
  });
}

export function useFinalizeGstr2b(filingId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => gstr2bApi.finalize(filingId!),
    onSuccess: () => {
      if (filingId) queryClient.invalidateQueries({ queryKey: GSTR2B_RECO_QUERY_KEYS.reconciliation(filingId) });
    },
  });
}

export interface Gstr2bInvoicePatch {
  invoiceId: number;
  patch: Gstr2bInvoiceUpdateRequest;
}

/** How many PATCHes are allowed in flight at once during a bulk action. */
const BULK_CONCURRENCY = 6;

/**
 * Applies the same per-invoice update as `useUpdateGstr2bInvoice` across a selection,
 * but invalidates once at the end instead of once per row — a bulk fix over a hundred
 * invoices should cost one refetch, not a hundred.
 */
export function useBulkUpdateGstr2bInvoices(filingId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Gstr2bInvoicePatch[]) => {
      for (let i = 0; i < updates.length; i += BULK_CONCURRENCY) {
        const slice = updates.slice(i, i + BULK_CONCURRENCY);
        await Promise.all(slice.map((u) => gstr2bApi.updateInvoice(u.invoiceId, u.patch)));
      }
      return updates.length;
    },
    onSettled: () => {
      if (filingId) queryClient.invalidateQueries({ queryKey: GSTR2B_RECO_QUERY_KEYS.reconciliation(filingId) });
    },
  });
}
