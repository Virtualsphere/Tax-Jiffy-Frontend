import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ewaybillRecoApi } from '../api/ewaybillReco.api';
import { eWayBillApi } from '@/pages/dashboard/eWayBill/api/ewaybill.api';
import type { EwbMatchStatus } from '../types/ewaybill-reco.types';

export const EWB_RECO_QUERY_KEYS = {
  all: ['ewaybillReco'] as const,
  result: (filingId: number, status?: EwbMatchStatus | 'ALL') =>
    [...EWB_RECO_QUERY_KEYS.all, filingId, 'result', status] as const,
  unlinked: (filingId: number) => [...EWB_RECO_QUERY_KEYS.all, filingId, 'unlinked'] as const,
  periodRecords: (companyGstId: number, syncDate: string) =>
    [...EWB_RECO_QUERY_KEYS.all, 'period-records', companyGstId, syncDate] as const,
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

/**
 * The raw e-way bills stored for this GSTIN + period.
 *
 * They hang off the E-Way Bill page's own filing (keyed by sync date), not off the GSTR-1
 * filing, so that filing has to be resolved first. Resolves to [] when nothing has been
 * synced or uploaded for the period yet.
 */
export function useEwaybillPeriodRecordsQuery(companyGstId?: number, syncDate?: string) {
  return useQuery({
    queryKey: EWB_RECO_QUERY_KEYS.periodRecords(companyGstId!, syncDate!),
    queryFn: async () => {
      const filing = await eWayBillApi.getFiling(companyGstId!, syncDate!);
      return filing ? await eWayBillApi.getRecords(filing.id) : [];
    },
    enabled: !!companyGstId && !!syncDate,
  });
}
