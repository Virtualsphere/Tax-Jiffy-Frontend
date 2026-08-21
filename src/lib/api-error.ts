import axios from 'axios';

/**
 * Human-readable one-liner for a failed request, including the status and the
 * path that was called. Without the path a missing backend route is
 * indistinguishable from an empty result, which hides real integration bugs.
 */
export function describeApiError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : 'Unexpected error';
  }

  const method = error.config?.method?.toUpperCase() ?? 'GET';
  const path = error.config?.url ?? '';
  const params = error.config?.params as Record<string, unknown> | undefined;
  const query = params
    ? Object.entries(params)
        .filter(([, v]) => v != null)
        .map(([k, v]) => `${k}=${v}`)
        .join('&')
    : '';
  const target = `${method} ${path}${query ? `?${query}` : ''}`;

  const status = error.response?.status;
  const serverMessage = (error.response?.data as { message?: string } | undefined)?.message;

  if (status === 404) {
    return `Endpoint not found (404) — ${target}. The backend may not expose this route.`;
  }
  if (status) {
    return `${serverMessage ?? error.message} (${status}) — ${target}`;
  }
  return `${error.message} — ${target}`;
}
