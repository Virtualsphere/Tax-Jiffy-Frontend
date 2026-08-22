import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { ImsFiling, ImsInvoice } from '../types/ims.types';

const BASE = '/ims';

export const imsApi = {
  getFiling: async (companyGstId: number, retPeriod: string) => {
    const { data } = await apiClient.get<ApiResponse<ImsFiling | null>>(
      `${BASE}/filings`,
      { params: { companyGstId, retPeriod } }
    );
    return data.data;
  },
  getInvoices: async (filingId: number) => {
    const { data } = await apiClient.get<ApiResponse<ImsInvoice[]>>(
      `${BASE}/filings/${filingId}/invoices`
    );
    return data.data ?? [];
  },
  upload: async (file: File, companyGstId: number, retPeriod: string) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<ApiResponse<any>>(
      `${BASE}/upload?companyGstId=${companyGstId}&retPeriod=${retPeriod}`,
      formData,
      {
        headers: { 'Content-Type': undefined },
        timeout: 0,
      }
    );
    return data.data;
  },
  sync: async (body: { companyGstId: number; retPeriod: string; section?: string; rtnTyp?: string }) => {
    const { data } = await apiClient.post<ApiResponse<any>>(`${BASE}/sync`, body);
    return data.data;
  },
};
