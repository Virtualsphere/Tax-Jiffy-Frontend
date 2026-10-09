import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { UserRequest, UserResponse } from '../types/user.types';
import type { UserGSTMappingResponse } from '../types/user-gst-mapping.types';

const BASE_URL = '/users';

export const userApi = {
  create: async (data: UserRequest): Promise<UserResponse> => {
    const response = await apiClient.post<ApiResponse<UserResponse>>(BASE_URL, data);
    return response.data.data;
  },

  getByCompany: async (companyId: number): Promise<UserResponse[]> => {
    const response = await apiClient.get<ApiResponse<UserResponse[]>>(`${BASE_URL}/by-company/${companyId}`);
    return response.data.data;
  },

  getById: async (id: number): Promise<UserResponse> => {
    const response = await apiClient.get<ApiResponse<UserResponse>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  deactivateMapping: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/user-gst-mapping/${id}`);
  },

  updateMappingRole: async (id: number, roleId: number): Promise<UserGSTMappingResponse> => {
    const response = await apiClient.put<ApiResponse<UserGSTMappingResponse>>(`/user-gst-mapping/${id}/role`, { roleId });
    return response.data.data;
  },

  getMappingsByGST: async (gstId: number): Promise<UserGSTMappingResponse[]> => {
    const response = await apiClient.get<ApiResponse<UserGSTMappingResponse[]>>(`/user-gst-mapping/by-company-gst/${gstId}`);
    return response.data.data;
  },
};
