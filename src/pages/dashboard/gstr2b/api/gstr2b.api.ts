import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { PrB2b, PurchaseRegisterFiling } from '@/pages/dashboard/purchaseRegister/api/purchaseRegisterApi';
import type {
  Gstr2bInvoiceUpdateRequest,
  Gstr2bReconciliationRow,
} from '../types/gstr2b-filing.types';

const BASE = '/gstr2b';

/**
 * Reconciliation-only API for the GSTR-2B page. Uploading GSTR-2B is the same action as
 * uploading the Purchase Register (see purchaseRegisterApi.upload) — there is no separate
 * GSTR-2B filing. This module only adds reconciliation/correction/finalize on top of it.
 */
export const gstr2bApi = {
  getReconciliation: async (gstr2FilingId: number) => {
    const { data } = await apiClient.get<ApiResponse<Gstr2bReconciliationRow[]>>(
      `${BASE}/filings/${gstr2FilingId}/reconciliation`
    );
    return data.data ?? [];
  },
  updateInvoice: async (invoiceId: number, patch: Gstr2bInvoiceUpdateRequest) => {
    const { data } = await apiClient.patch<ApiResponse<PrB2b>>(
      `${BASE}/invoices/${invoiceId}`,
      patch
    );
    return data.data;
  },
  finalize: async (gstr2FilingId: number) => {
    const { data } = await apiClient.post<ApiResponse<PurchaseRegisterFiling>>(
      `${BASE}/filings/${gstr2FilingId}/finalize`
    );
    return data.data;
  },
};
