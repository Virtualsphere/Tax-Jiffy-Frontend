import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type {
  EInvoiceRecoSyncResponse,
  SaleRegisterRow,
  EInvoiceRow,
  ReconciliationRow,
  MatchStatus,
} from '../types/einvoice-reco.types';

const BASE = '/gstr1/filings';

export const einvoiceRecoApi = {
  /**
   * Syncs e-invoices for the given filing and returns sync summary
   */
  syncEInvoiceReco: async (filingId: number): Promise<EInvoiceRecoSyncResponse> => {
    const { data } = await apiClient.post<ApiResponse<EInvoiceRecoSyncResponse>>(
      `${BASE}/${filingId}/einvoice-reco/sync`
    );
    return data.data;
  },

  /**
   * Retrieves the sale register rows uploaded for the given filing
   */
  getSaleRegister: async (filingId: number): Promise<SaleRegisterRow[]> => {
    const { data } = await apiClient.get<ApiResponse<SaleRegisterRow[]>>(
      `${BASE}/${filingId}/einvoice-reco/sale-register`
    );
    return data.data;
  },

  /**
   * Retrieves the synced e-invoice rows for the given filing
   */
  getEInvoices: async (filingId: number): Promise<EInvoiceRow[]> => {
    const { data } = await apiClient.get<ApiResponse<EInvoiceRow[]>>(
      `${BASE}/${filingId}/einvoice-reco/einvoices`
    );
    return data.data;
  },

  /**
   * Retrieves the reconciliation result, optionally filtered by match status
   */
  getReconciliationResult: async (
    filingId: number,
    matchStatus?: MatchStatus
  ): Promise<ReconciliationRow[]> => {
    const url = matchStatus
      ? `${BASE}/${filingId}/einvoice-reco/result?matchStatus=${matchStatus}`
      : `${BASE}/${filingId}/einvoice-reco/result`;
    
    const { data } = await apiClient.get<ApiResponse<ReconciliationRow[]>>(url);
    return data.data;
  },

  /**
   * Retrieves the unlinked sale register invoices (IN_SALE_REGISTER_ONLY)
   */
  getUnlinked: async (filingId: number): Promise<ReconciliationRow[]> => {
    const { data } = await apiClient.get<ApiResponse<ReconciliationRow[]>>(
      `${BASE}/${filingId}/einvoice-reco/unlinked`
    );
    return data.data;
  },
};
