import axios from 'axios';
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';

/**
 * GST portal (GSTN) session for one GSTIN, managed by the backend.
 * Flow: requestOtp (GSTN texts an OTP to the taxpayer) -> verifyOtp -> session ACTIVE for ~6h.
 * API keys and the txn token never reach the browser.
 */
export type GstSessionStatus = {
  companyGstId: number;
  gstin: string | null;
  gstUsername: string | null;
  status: 'NONE' | 'OTP_SENT' | 'ACTIVE' | 'EXPIRED';
  active: boolean;
  authenticatedAt: string | null;
  expiresAt: string | null;
};

const base = (companyGstId: number) => `/gst-session/${companyGstId}`;

export const gstSessionApi = {
  getStatus: async (companyGstId: number): Promise<GstSessionStatus> => {
    const { data } = await apiClient.get<ApiResponse<GstSessionStatus>>(base(companyGstId));
    return data.data;
  },
  requestOtp: async (companyGstId: number, gstUsername: string): Promise<GstSessionStatus> => {
    const { data } = await apiClient.post<ApiResponse<GstSessionStatus>>(
      `${base(companyGstId)}/otp`,
      { gstUsername },
    );
    return data.data;
  },
  verifyOtp: async (companyGstId: number, otp: string): Promise<GstSessionStatus> => {
    const { data } = await apiClient.post<ApiResponse<GstSessionStatus>>(
      `${base(companyGstId)}/verify`,
      { otp },
    );
    return data.data;
  },
};

/** The backend answers 428 when a GST API call needs a verified OTP session first. */
export function isGstSessionRequired(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 428;
}

/** Best human-readable message from a backend error. */
export function apiErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(err)) {
    const msg = (err.response?.data as { message?: string } | undefined)?.message;
    if (msg) return msg;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
