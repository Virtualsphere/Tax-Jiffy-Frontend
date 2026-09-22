import axios from 'axios';
import { apiClient } from './api-client';
import type { ApiResponse } from '@/types';

/**
 * Blank Excel templates served by the backend's TemplateDownloadController
 * (GET /api/templates/{key}). The keys mirror TemplateType on the server —
 * adding one there means adding it here.
 */
export const TEMPLATE_KEYS = ['gstr1', 'gstr2', 'einvoice', 'ewaybill', 'ims'] as const;

export type TemplateKey = (typeof TEMPLATE_KEYS)[number];

export interface TemplateInfo {
  key: string;
  label: string;
  fileName: string;
  downloadUrl: string;
}

/**
 * Used only when the response carries no Content-Disposition — a proxy that strips
 * the header would otherwise save every template as an extensionless "download".
 * Values match TemplateType.downloadFileName on the backend.
 */
const FALLBACK_FILE_NAMES: Record<TemplateKey, string> = {
  gstr1: 'GSTR1_Excel_Workbook_Template.xlsx',
  gstr2: 'GSTR2_Purchase_Return_Template.xlsx',
  einvoice: 'EInvoice_Manual_Entry_Template.xlsx',
  ewaybill: 'EWayBill_Manual_Entry_Template.xlsx',
  ims: 'IMS_Upload_Template.xlsx',
};

/** Human-readable name per template, for button titles and error messages. */
export const TEMPLATE_LABELS: Record<TemplateKey, string> = {
  gstr1: 'GSTR-1 Excel Workbook Template',
  gstr2: 'GSTR-2 / Purchase Return Template',
  einvoice: 'E-Invoice Manual Entry Template',
  ewaybill: 'E-Way Bill Manual Entry Template',
  ims: 'IMS Upload Template',
};

/**
 * Pulls the filename out of `attachment; filename="GSTR1_....xlsx"`, preferring the
 * RFC 5987 `filename*` form when the server sends one.
 */
function parseFileName(disposition: string | undefined): string | null {
  if (!disposition) return null;

  const extended = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(disposition);
  if (extended?.[1]) {
    try {
      return decodeURIComponent(extended[1].trim().replace(/^"|"$/g, ''));
    } catch {
      // Malformed percent-encoding — fall through to the plain form.
    }
  }

  const plain = /filename="?([^";]+)"?/i.exec(disposition);
  return plain?.[1]?.trim() ?? null;
}

/**
 * With `responseType: 'blob'` axios hands back an error body as a Blob too, so the
 * server's JSON `{ message }` never reaches describeApiError and the user sees
 * "[object Blob]". Read it back into a plain object before the error propagates.
 */
async function withReadableBlobError(error: unknown): Promise<never> {
  if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
    try {
      const text = await error.response.data.text();
      error.response.data = text ? JSON.parse(text) : undefined;
    } catch {
      // Not JSON (an HTML error page, say) — leave the original body alone.
    }
  }
  throw error;
}

/**
 * Saves a blob to disk under `fileName` by clicking a temporary object-URL anchor.
 * The URL is revoked on the next tick, once the browser has taken over the download.
 */
function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export const templatesApi = {
  /** Every template the backend currently offers, with its label and download URL. */
  list: async (): Promise<TemplateInfo[]> => {
    const { data } = await apiClient.get<ApiResponse<TemplateInfo[]>>('/templates');
    return data.data ?? [];
  },

  /**
   * Fetches a template as a blob. The route sits behind `anyRequest().authenticated()`
   * on the backend, so it has to go through apiClient (which attaches the Bearer token)
   * rather than a plain anchor href or window.open — those send no Authorization header
   * and come back 401.
   */
  fetchBlob: async (key: TemplateKey): Promise<{ blob: Blob; fileName: string }> => {
    const response = await apiClient
      .get<Blob>(`/templates/${key}`, { responseType: 'blob' })
      .catch(withReadableBlobError);

    const disposition = response.headers?.['content-disposition'] as string | undefined;

    return {
      blob: response.data,
      fileName: parseFileName(disposition) ?? FALLBACK_FILE_NAMES[key],
    };
  },
};

/** Downloads a template and hands it to the browser's save flow. */
export async function downloadTemplate(key: TemplateKey): Promise<void> {
  const { blob, fileName } = await templatesApi.fetchBlob(key);
  saveBlob(blob, fileName);
}
