import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { EinvoiceFiling, EinvoiceIrn } from '../types/einvoice.types';

const BASE = '/einvoice';

export const eInvoiceApi = {
  getFiling: async (companyGstId: number, retPeriod: string) => {
    const { data } = await apiClient.get<ApiResponse<EinvoiceFiling | null>>(
      `${BASE}/filings`,
      { params: { companyGstId, retPeriod } }
    );
    return data.data;
  },
  getIrns: async (filingId: number) => {
    const { data } = await apiClient.get<ApiResponse<EinvoiceIrn[]>>(
      `${BASE}/filings/${filingId}/irns`
    );
    return data.data ?? [];
  },
  sync: async (body: { companyGstId: number; retPeriod: string }) => {
    const { data } = await apiClient.post<ApiResponse<any>>(
      `${BASE}/sync`,
      body
    );
    return data.data;
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
  }
};
