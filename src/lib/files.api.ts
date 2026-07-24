import { apiClient } from './api-client';

export interface FileUploadResponse {
  url: string;
  fileName: string;
  originalFileName: string;
  contentType: string;
  sizeBytes: number;
}

export const filesApi = {
  upload: async (file: File): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<FileUploadResponse>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }
};

/**
 * Converts an absolute backend-generated image URL
 * (e.g. https://api.taxjiffy.com/uploads/photos/abc.png)
 * into a root-relative path (/uploads/photos/abc.png).
 *
 * In development the Vite proxy forwards /uploads/* to the backend.
 * In production the frontend and backend share the same origin,
 * so the relative path resolves correctly there too.
 *
 * Falls back to the original URL for external images (e.g. placeholder services).
 */
export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    // Only rewrite URLs whose path starts with /uploads — these are backend-served images.
    if (parsed.pathname.startsWith('/uploads')) {
      return parsed.pathname;
    }
  } catch {
    // url is already relative or invalid — return as-is
  }
  return url;
}
