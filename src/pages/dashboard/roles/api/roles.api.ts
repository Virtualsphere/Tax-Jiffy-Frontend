import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { RolesRequest, RolesResponse } from '../types/roles.types';

const BASE_URL = '/roles';

export const rolesApi = {
  getAll: async (): Promise<RolesResponse[]> => {
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
