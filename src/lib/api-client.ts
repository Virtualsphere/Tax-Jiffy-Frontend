import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { ROUTES } from '@/config/routes';
import { authStorage } from '@/features/auth/lib/auth-storage';

export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30_000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authStorage.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      authStorage.clearToken();

      // A 401 from the login call itself means "wrong credentials" — the form
      // shows that inline. Redirecting only makes sense for an expired session
      // on some other page, and never when we are already on an auth screen.
      const isLoginAttempt = error.config?.url?.includes('/auth/login') ?? false;
      const onAuthScreen = window.location.pathname.startsWith(ROUTES.auth.root);

      if (!isLoginAttempt && !onAuthScreen) {
        window.location.assign(`${ROUTES.auth.login}?session=expired`);
      }
    }

    return Promise.reject(error);
  },
);
