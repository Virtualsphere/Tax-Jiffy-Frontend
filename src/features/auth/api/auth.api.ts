import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { AuthSession, LoginCredentials, SignupCredentials } from '@/features/auth/types/auth.types';

const AUTH_BASE = '/auth';
const USERS_BASE = '/users';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthSession> => {
    const { data } = await apiClient.post<ApiResponse<AuthSession>>(
      `${AUTH_BASE}/login`,
      credentials,
    );
    return data.data;
  },
  signup: async (credentials: SignupCredentials): Promise<void> => {
    // The backend signup endpoint doesn't return an AuthSession, so we return void or whatever it returns.
    await apiClient.post(`${USERS_BASE}/register`, credentials);
  },
};
