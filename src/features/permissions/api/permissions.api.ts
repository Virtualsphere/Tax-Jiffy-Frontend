import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { MyPermissionsResponse } from '../types/permissions.types';

export const permissionsApi = {
  getMine: async (companyGstId: number): Promise<MyPermissionsResponse> => {
    const response = await apiClient.get<ApiResponse<MyPermissionsResponse>>('/permissions/me', {
      params: { companyGstId },
    });
    return response.data.data;
  },
};
