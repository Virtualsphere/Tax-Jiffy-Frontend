import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';

const BASE = '/ewaybill';

export const eWayBillApi = {
  sync: async (body: { companyGstId: number; syncDate: string }) => {
    const { data } = await apiClient.post<ApiResponse<any>>(
      `${BASE}/sync`,
      body
    );
    return data.data;
  },
  upload: async (file: File, companyGstId: number, syncDate: string) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<ApiResponse<any>>(
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
