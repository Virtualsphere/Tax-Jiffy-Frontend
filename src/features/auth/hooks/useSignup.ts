import { useCallback, useState } from 'react';
import { validateSignup, type SignupFormValues } from '@/features/auth/lib/validate-signup';

// TODO: Replace with useMutation(() => authApi.signup(data))
// when the backend endpoint POST /auth/signup is available.
// After signup, either auto-login or redirect to login page.

type UseSignupReturn = {
  /** Submit signup form data */
  mutate: (values: SignupFormValues) => void;
  /** Whether signup submission is in progress */
  isPending: boolean;
  /** Whether an error occurred */
  isError: boolean;
  /** Error message if any */
  error: string | null;
  /** Whether signup was successful */
  isSuccess: boolean;
  /** Reset state */
  reset: () => void;
};

export function useSignup(): UseSignupReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const mutate = useCallback((values: SignupFormValues) => {
    setError(null);
    setIsSuccess(false);

    // Client-side validation
    const validation = validateSignup(values);
    if (!validation.success) {
      setError(validation.error.errors[0]?.message ?? 'Invalid form data');
      return;
    }

    // TODO: Replace with actual API call — POST /auth/signup
    // For now, simulate a brief "pending" state and then success
    setIsPending(true);
    setTimeout(() => {
      setIsPending(false);
      setIsSuccess(true);
      console.info('[auth] signup mock success:', { email: values.email, username: values.username });
    }, 800);
  }, []);

  const reset = useCallback(() => {
    setIsPending(false);
    setError(null);
    setIsSuccess(false);
  }, []);

  return {
    mutate,
    isPending,
    isError: error !== null,
    error,
    isSuccess,
    reset,
  };
}
