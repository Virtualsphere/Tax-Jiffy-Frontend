import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { EwaybillReconciliationRow, EwbMatchStatus } from '../types/ewaybill-reco.types';

const BASE = '/gstr1/filings';

export const ewaybillRecoApi = {
  /**
   * Re-runs the bucket match for this filing against whatever e-way bill data
   * already exists (no external GST-portal call — that happens on the E-Way Bill page).
   */
  reconcile: async (filingId: number): Promise<EwaybillReconciliationRow[]> => {
    const { data } = await apiClient.post<ApiResponse<EwaybillReconciliationRow[]>>(
      `${BASE}/${filingId}/ewaybill-reco/reconcile`
    );
    return data.data;
  },

  /**
   * Retrieves the reconciliation result, optionally filtered by match status
   */
  getReconciliationResult: async (
    filingId: number,
    matchStatus?: EwbMatchStatus
  ): Promise<EwaybillReconciliationRow[]> => {
    const url = matchStatus
      ? `${BASE}/${filingId}/ewaybill-reco/result?matchStatus=${matchStatus}`
      : `${BASE}/${filingId}/ewaybill-reco/result`;

    const { data } = await apiClient.get<ApiResponse<EwaybillReconciliationRow[]>>(url);
    return data.data;
  },

  /**
   * Retrieves the unlinked sale register invoices (IN_SALE_REGISTER_ONLY)
   */
  getUnlinked: async (filingId: number): Promise<EwaybillReconciliationRow[]> => {
    const { data } = await apiClient.get<ApiResponse<EwaybillReconciliationRow[]>>(
      `${BASE}/${filingId}/ewaybill-reco/unlinked`
    );
    return data.data;
  },
};
