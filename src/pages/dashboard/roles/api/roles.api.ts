import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { RolesRequest, RolesResponse } from '../types/roles.types';

const BASE_URL = '/roles';

export const rolesApi = {
  getAll: async (companyId?: number, companyGstId?: number): Promise<RolesResponse[]> => {
    if (companyId && companyGstId) {
      const params = new URLSearchParams();
      params.append('companyId', companyId.toString());
      params.append('companyGstId', companyGstId.toString());
      const response = await apiClient.get<ApiResponse<RolesResponse[]>>(`${BASE_URL}/by-company-and-gst?${params.toString()}`);
      return response.data.data;
    }
    const response = await apiClient.get<ApiResponse<RolesResponse[]>>(BASE_URL);
    return response.data.data;
  },

  getById: async (id: number): Promise<RolesResponse> => {
    const response = await apiClient.get<ApiResponse<RolesResponse>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  create: async (data: RolesRequest): Promise<RolesResponse> => {
    const response = await apiClient.post<ApiResponse<RolesResponse>>(BASE_URL, data);
    return response.data.data;
  },

  update: async (id: number, data: RolesRequest): Promise<RolesResponse> => {
    const response = await apiClient.put<ApiResponse<RolesResponse>>(`${BASE_URL}/${id}`, data);
    return response.data.data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`${BASE_URL}/${id}`);
  },
};
