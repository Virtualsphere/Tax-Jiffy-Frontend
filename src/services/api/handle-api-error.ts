import type { AxiosError } from 'axios';
import type { ApiError } from '@/types';

export function handleApiError(error: unknown): ApiError {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string; code?: string } | undefined;

    return {
      message: data?.message ?? error.message ?? 'Request failed',
      code: data?.code,
      status: error.response?.status,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: 'An unexpected error occurred' };
}

function isAxiosError(error: unknown): error is AxiosError {
  return typeof error === 'object' && error !== null && 'isAxiosError' in error;
}
