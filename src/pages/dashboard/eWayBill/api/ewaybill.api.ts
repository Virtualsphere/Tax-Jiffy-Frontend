import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { EWayBillFiling, EWayBillRecord } from '../types/ewaybill.types';

const BASE = '/ewaybill';

export const eWayBillApi = {
  /** Resolves the filing stored for a company + sync date, or null when the period is empty. */
  getFiling: async (companyGstId: number, syncDate: string) => {
    const { data } = await apiClient.get<ApiResponse<EWayBillFiling | null>>(
      `${BASE}/filings`,
      { params: { companyGstId, syncDate } }
    );
    return data.data;
  },
  getRecords: async (filingId: number) => {
    const { data } = await apiClient.get<ApiResponse<EWayBillRecord[]>>(
      `${BASE}/filings/${filingId}/records`
    );
    return data.data ?? [];
  },
  /** Body field is `date`, not `syncDate` — see EwaybillSyncByDateRequest. */
  sync: async (body: { companyGstId: number; date: string }) => {
    const { data } = await apiClient.post<ApiResponse<EWayBillFiling>>(
      `${BASE}/sync`,
      body
    );
    return data.data;
  },
  upload: async (file: File, companyGstId: number, syncDate: string) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<ApiResponse<EWayBillFiling>>(
      `${BASE}/upload?companyGstId=${companyGstId}&syncDate=${syncDate}`,
      formData,
      {
        headers: { 'Content-Type': undefined },
        timeout: 0,
      }
    );
    return data.data;
  }
};
