import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { CompanyGSTRequest, CompanyGSTResponse, PurchaseSubscriptionRequest } from '../types/company-gst.types';

const BASE_URL = '/company-gst';

export const companyGSTApi = {
  create: async (data: CompanyGSTRequest): Promise<CompanyGSTResponse> => {
    const response = await apiClient.post<ApiResponse<CompanyGSTResponse>>(BASE_URL, data);
    return response.data.data;
  },

  purchase: async (id: number, data: PurchaseSubscriptionRequest): Promise<CompanyGSTResponse> => {
    const response = await apiClient.post<ApiResponse<CompanyGSTResponse>>(`${BASE_URL}/${id}/purchase`, data);
    return response.data.data;
  },

  getByCompany: async (companyId: number): Promise<CompanyGSTResponse[]> => {
    const response = await apiClient.get<ApiResponse<CompanyGSTResponse[]>>(`${BASE_URL}/by-company/${companyId}`);
    return response.data.data;
  },

  getById: async (id: number): Promise<CompanyGSTResponse> => {
    const response = await apiClient.get<ApiResponse<CompanyGSTResponse>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  update: async (id: number, data: Partial<CompanyGSTRequest>): Promise<CompanyGSTResponse> => {
    const response = await apiClient.put<ApiResponse<CompanyGSTResponse>>(`${BASE_URL}/${id}`, data);
    return response.data.data;
  },
};
