import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { AuthSession, LoginCredentials } from '@/features/auth/types/auth.types';

const AUTH_BASE = '/auth';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthSession> => {
    const { data } = await apiClient.post<ApiResponse<AuthSession>>(
      `${AUTH_BASE}/login`,
      credentials,
    );
    return data.data;
  },
};
