import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { CompanyProfileRequest, CompanyProfileResponse } from '../types/company.types';

const BASE_URL = '/companies';

export const companyApi = {
  create: async (data: CompanyProfileRequest): Promise<CompanyProfileResponse> => {
    const response = await apiClient.post<ApiResponse<CompanyProfileResponse>>(BASE_URL, data);
    return response.data.data;
  },

  getAll: async (): Promise<CompanyProfileResponse[]> => {
    const response = await apiClient.get<ApiResponse<CompanyProfileResponse[]>>(BASE_URL);
    return response.data.data;
  },

  getMy: async (): Promise<CompanyProfileResponse[]> => {
    const response = await apiClient.get<ApiResponse<CompanyProfileResponse[]>>(`${BASE_URL}/my`);
    return response.data.data;
  },


  getById: async (id: number): Promise<CompanyProfileResponse> => {
    const response = await apiClient.get<ApiResponse<CompanyProfileResponse>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },
};
