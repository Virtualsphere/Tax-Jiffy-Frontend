import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { RoleMappingRequest, RoleMappingResponse } from '../types/roleMapping.types';

const BASE_URL = '/role-mapping';

export const roleMappingApi = {
  getByRoleAndGST: async (roleId: number, companyGstId: number): Promise<RoleMappingResponse[]> => {
    const response = await apiClient.get<ApiResponse<RoleMappingResponse[]>>(
      `${BASE_URL}/by-role-and-gst`,
      { params: { roleId, companyGstId } }
    );
    return response.data.data;
  },

  create: async (data: RoleMappingRequest): Promise<RoleMappingResponse> => {
    const response = await apiClient.post<ApiResponse<RoleMappingResponse>>(BASE_URL, data);
    return response.data.data;
  },

  update: async (id: number, data: RoleMappingRequest): Promise<RoleMappingResponse> => {
    const response = await apiClient.put<ApiResponse<RoleMappingResponse>>(`${BASE_URL}/${id}`, data);
    return response.data.data;
  },
};
