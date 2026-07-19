import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';

const BASE = '/gstr3b';

// ── Entity types ──────────────────────────────────────────────────────────

export interface Gstr3bFiling {
  id: number;
  financialYear: string;
  taxPeriod: string;
  filingStatus: string;
  imsSyncStatus: string | null;
  imsSyncedAt: string | null;
  twoBSyncStatus: string | null;
  twoBSyncedAt: string | null;
  gstr1FilingId: number | null;
  gstr2FilingId: number | null;
  interestIntegratedTax: number;
  interestCentralTax: number;
  interestStateUtTax: number;
  interestCess: number;
  lateFeeCentralTax: number;
  lateFeeStateUtTax: number;
  isActive: boolean;
  createdDate: string;
}

export interface Gstr3bFilingLinkRequest {
  companyGstId: number;
  financialYear: string;
  taxPeriod: string;
  gstr1FilingId?: number;
  gstr2FilingId?: number;
}

export interface Gstr3bInterestLateFeeRequest {
  interestIntegratedTax?: number;
  interestCentralTax?: number;
  interestStateUtTax?: number;
  interestCess?: number;
  lateFeeCentralTax?: number;
  lateFeeStateUtTax?: number;
}

export interface ImsCredentials {
  gstin: string;
  email: string;
  retperiod: string;
  section: string;
  rtnTyp: string;
  gstUsername: string;
  stateCd: string;
  ipAddress: string;
  txn: string;
  clientId: string;
  clientSecret: string;
}

export interface TwoBCredentials {
  gstin: string;
  rtnprd: string;
  filenum: string;
  email: string;
  gstUsername: string;
  stateCd: string;
  ipAddress: string;
  txn: string;
  clientId: string;
  clientSecret: string;
}

// Preview response types (mirrors Gstr3bPreviewResponse.java)
export interface PreviewRow31 {
  id: string;
  nature_of_supply: string;
  taxable_value: number | null;
  integrated_tax: number | null;
  central_tax: number | null;
  state_ut_tax: number | null;
  cess: number | null;
}

export interface PreviewTable31 {
  title: string;
  headers: string[];
  rows: PreviewRow31[];
  total: {
    taxable_value: number;
    integrated_tax: number;
    central_tax: number;
    state_ut_tax: number;
    cess: number;
  };
}

export interface PreviewRow32 {
  place_of_supply: string;
  taxable_value: number;
  integrated_tax: number;
}

export interface PreviewSection32 {
  title: string;
  rows: PreviewRow32[];
}

export interface PreviewTable32 {
  title: string;
  headers: string[];
  sections: PreviewSection32[];
}

export interface PreviewRow4 {
  id: string;
  detail: string;
  integrated_tax: number | null;
  central_tax: number | null;
  state_ut_tax: number | null;
  cess: number | null;
}

export interface PreviewSection4 {
  id: string;
  title: string;
  rows: PreviewRow4[];
}

export interface PreviewTable4 {
  title: string;
  headers: string[];
  sections: PreviewSection4[];
}

export interface PreviewRow5 {
  id: string;
  nature_of_supply: string;
  inter_state_supplies: number;
  intra_state_supplies: number;
}

export interface PreviewTable5 {
  title: string;
  headers: string[];
  rows: PreviewRow5[];
}

export interface PreviewRow51 {
  id: string;
  description: string;
  integrated_tax: number;
  central_tax: number;
  state_ut_tax: number;
  cess: number;
}

export interface PreviewTable51 {
  title: string;
  headers: string[];
  rows: PreviewRow51[];
}

export interface PreviewRow61 {
  description: string;
  tax_payable: number;
  paid_itc_integrated: number;
  paid_itc_central: number;
  paid_itc_state_ut: number;
  paid_itc_cess: number;
  tax_paid_tds_tcs: number;
  tax_paid_cash: number;
  interest_paid_cash: number;
  late_fee_paid_cash: number;
}

export interface PreviewTable61 {
  title: string;
  headers: string[];
  rows: PreviewRow61[];
}

export interface Gstr3bPreviewResponse {
  gstr3b: {
    table_3_1_outward_and_reverse_charge_inward_supplies: PreviewTable31;
    table_3_2_interstate_supplies: PreviewTable32;
    table_4_eligible_itc: PreviewTable4;
    table_5_exempt_nil_nongst_inward_supplies: PreviewTable5;
    table_5_1_interest_and_late_fee: PreviewTable51;
    table_6_1_payment_of_tax: PreviewTable61;
  };
}

// ── API ───────────────────────────────────────────────────────────────────

export const gstr3bApi = {
  /** Create or get a GSTR-3B filing for a period */
  createOrLinkFiling: async (req: Gstr3bFilingLinkRequest): Promise<Gstr3bFiling> => {
    const { data } = await apiClient.post<ApiResponse<Gstr3bFiling>>(`${BASE}/filings`, req);
    return data.data;
  },

  /** List all active filings for a companyGST */
  getFilingsByCompanyGst: async (companyGstId: number): Promise<Gstr3bFiling[]> => {
    const { data } = await apiClient.get<ApiResponse<Gstr3bFiling[]>>(
      `${BASE}/filings/by-company-gst/${companyGstId}`,
    );
    return data.data;
  },

  /** Get a single filing */
  getFilingById: async (filingId: number): Promise<Gstr3bFiling> => {
    const { data } = await apiClient.get<ApiResponse<Gstr3bFiling>>(`${BASE}/filings/${filingId}`);
    return data.data;
  },

  /** Sync IMS invoices into the filing */
  syncIms: async (filingId: number, credentials: ImsCredentials): Promise<{ rowsSynced: number }> => {
    const { data } = await apiClient.post<ApiResponse<{ rowsSynced: number }>>(
      `${BASE}/filings/${filingId}/sync-ims`,
      credentials,
    );
    return data.data;
  },

  /** Sync GSTR-2B ITC summary into the filing */
  sync2b: async (filingId: number, credentials: TwoBCredentials): Promise<{ rowsSynced: number }> => {
    const { data } = await apiClient.post<ApiResponse<{ rowsSynced: number }>>(
      `${BASE}/filings/${filingId}/sync-2b`,
      credentials,
    );
    return data.data;
  },

  /** Update interest and late fee for table 5.1 */
  updateInterestLateFee: async (
    filingId: number,
    req: Gstr3bInterestLateFeeRequest,
  ): Promise<Gstr3bFiling> => {
    const { data } = await apiClient.put<ApiResponse<Gstr3bFiling>>(
      `${BASE}/filings/${filingId}/interest-late-fee`,
      req,
    );
    return data.data;
  },

  /** Get the full GSTR-3B preview (tables 3.1–6.1) */
  getPreview: async (filingId: number): Promise<Gstr3bPreviewResponse> => {
    const { data } = await apiClient.get<ApiResponse<Gstr3bPreviewResponse>>(
      `${BASE}/filings/${filingId}/preview`,
    );
    return data.data;
  },
};
