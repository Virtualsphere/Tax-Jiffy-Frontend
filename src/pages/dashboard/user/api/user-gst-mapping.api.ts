import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { UserGSTMappingResponse } from '../types/user-gst-mapping.types';

const BASE_URL = '/user-gst-mapping';

export const userGSTMappingApi = {
  getByUser: async (userId: number): Promise<UserGSTMappingResponse[]> => {
    const response = await apiClient.get<ApiResponse<UserGSTMappingResponse[]>>(`${BASE_URL}/by-user/${userId}`);
    return response.data.data;
  },
};
