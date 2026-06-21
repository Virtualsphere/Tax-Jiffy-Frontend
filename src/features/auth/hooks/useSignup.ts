import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { authApi } from '@/features/auth/api/auth.api';
import { validateSignup, type SignupFormValues } from '@/features/auth/lib/validate-signup';
import { handleApiError } from '@/services/api';

export function useSignup() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (values: SignupFormValues) => {
      const validation = validateSignup(values);

      if (!validation.success) {
        throw new Error(validation.error.errors[0]?.message ?? 'Invalid form data');
      }

      // Map frontend form values to backend UserRequest
      // Hardcoding companyId: 1 for now as a temporary measure since the backend requires it
      return authApi.signup({
        companyId: 1,
        userName: validation.data.username,
        userEmail: validation.data.email,
        userPassword: validation.data.password,
      });
    },
    onSuccess: () => {
      // After successful registration, redirect to login page
      void navigate(ROUTES.auth.login);
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      console.error('[auth] signup failed:', apiError.message);
    },
  });
}
