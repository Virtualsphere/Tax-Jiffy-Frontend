import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';

const BASE = '/einvoice';

export const eInvoiceApi = {
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
