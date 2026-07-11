import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { authApi } from '@/features/auth/api/auth.api';
import { authStorage } from '@/features/auth/lib/auth-storage';
import { validateLogin } from '@/features/auth/lib/validate-login';
import type { LoginCredentials } from '@/features/auth/types/auth.types';
import { handleApiError } from '@/services/api';

export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const validation = validateLogin(credentials);

      if (!validation.success) {
        throw new Error(validation.error.errors[0]?.message ?? 'Invalid credentials');
      }

      return authApi.login(validation.data);
    },
    onSuccess: (session) => {
      authStorage.setToken(session.token);
      authStorage.setUser({
        userId: session.userId,
        userName: session.userName,
        email: session.email,
      });
      void navigate(ROUTES.dashboard.companies);
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      console.error('[auth] login failed:', apiError.message);
    },
  });
}
