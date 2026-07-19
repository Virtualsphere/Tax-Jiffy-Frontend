import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';

const BASE = '/gstr2';

// ── Entity types (matching backend entities) ──────────────────────────────

export interface PurchaseRegisterFiling {
  id: number;
  financialYear: string;
  taxPeriod: string;
  filingStatus: string;
  originalFileName: string;
  isActive: boolean;
  createdDate: string;
}

export interface PurchaseRegisterUploadResponse {
  filingId: number;
  financialYear: string;
  taxPeriod: string;
  originalFileName: string;
  totalRowsImported: number;
}

export interface PrB2b {
  id: number;
  gstinOfSupplier: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceValue: number;
  placeOfSupply: string;
  reverseCharge: string;
  invoiceType: string;
  rate: number;
  taxableValue: number;
  integratedTaxPaid: number;
  centralTaxPaid: number;
  stateUtTaxPaid: number;
  cessPaid: number;
  eligibilityForItc: string;
  availedItcIntegratedTax: number;
  availedItcCentralTax: number;
  availedItcStateUtTax: number;
  availedItcCess: number;
}

export interface PrB2bur {
  id: number;
  supplierName: string;
  supplierAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceValue: number;
  placeOfSupply: string;
  reverseCharge: string;
  invoiceType: string;
  rate: number;
  taxableValue: number;
  integratedTaxPaid: number;
  centralTaxPaid: number;
  stateUtTaxPaid: number;
  cessPaid: number;
  eligibilityForItc: string;
  availedItcIntegratedTax: number;
  availedItcCentralTax: number;
  availedItcStateUtTax: number;
  availedItcCess: number;
}

export interface PrCdnr {
  id: number;
  gstinOfSupplier: string;
  noteRefundVoucherNumber: string;
  noteRefundVoucherDate: string;
  invoiceAdvancePaymentVoucherNumber: string;
  invoiceAdvancePaymentVoucherDate: string;
  preGst: string;
  documentType: string;
  reasonForIssuingDocument: string;
  supplyType: string;
  noteRefundVoucherValue: number;
  rate: number;
  taxableValue: number;
  integratedTaxPaid: number;
  centralTaxPaid: number;
  stateUtTaxPaid: number;
  cessPaid: number;
  eligibilityForItc: string;
  availedItcIntegratedTax: number;
  availedItcCentralTax: number;
  availedItcStateUtTax: number;
  availedItcCess: number;
}

export interface PrCdnur {
  id: number;
  documentType: string;
  noteRefundVoucherNumber: string;
  noteRefundVoucherDate: string;
  reasonForIssuingDocument: string;
  supplyType: string;
  noteRefundVoucherValue: number;
  rate: number;
  taxableValue: number;
  integratedTaxPaid: number;
  centralTaxPaid: number;
  stateUtTaxPaid: number;
  cessPaid: number;
  eligibilityForItc: string;
  availedItcIntegratedTax: number;
  availedItcCentralTax: number;
  availedItcStateUtTax: number;
  availedItcCess: number;
}

export interface PrAt {
  id: number;
  placeOfSupply: string;
  rate: number;
  grossAdvancePaid: number;
  integratedTaxPaid: number;
  centralTaxPaid: number;
  stateUtTaxPaid: number;
  cessPaid: number;
  eligibilityForItc: string;
  availedItcIntegratedTax: number;
  availedItcCentralTax: number;
  availedItcStateUtTax: number;
  availedItcCess: number;
}

export interface PrAtadj {
  id: number;
  placeOfSupply: string;
  rate: number;
  grossAdvancePaidAdjusted: number;
  integratedTaxPaid: number;
  centralTaxPaid: number;
  stateUtTaxPaid: number;
  cessPaid: number;
  eligibilityForItc: string;
  availedItcIntegratedTax: number;
  availedItcCentralTax: number;
  availedItcStateUtTax: number;
  availedItcCess: number;
}

export interface PrExemp {
  id: number;
  descriptionOfSupply: string;
  nilRatedSupplies: number;
  exemptedOtherThanNilRatedNonGst: number;
  nonGstSupplies: number;
}

export interface PrHsnSum {
  id: number;
  hsn: string;
  description: string;
  uqc: string;
  totalQuantity: number;
  totalValue: number;
  taxableValue: number;
  integratedTaxAmount: number;
  centralTaxAmount: number;
  stateUtTaxAmount: number;
  cessAmount: number;
}

export interface PrImpg {
  id: number;
  portCode: string;
  billOfEntryNumber: string;
  billOfEntryDate: string;
  billOfEntryValue: number;
  taxableValue: number;
  integratedTaxPaid: number;
  cessPaid: number;
}

export interface PrImps {
  id: number;
  documentNumber: string;
  documentDate: string;
  documentValue: number;
  placeOfSupply: string;
  taxableValue: number;
  integratedTaxPaid: number;
  centralTaxPaid: number;
  stateUtTaxPaid: number;
  cessPaid: number;
  eligibilityForItc: string;
  availedItcIntegratedTax: number;
  availedItcCentralTax: number;
  availedItcStateUtTax: number;
  availedItcCess: number;
}

export interface PrItcr {
  id: number;
  itcReversalReason: string;
  taxableValue: number;
  integratedTaxAmount: number;
  centralTaxAmount: number;
  stateUtTaxAmount: number;
  cessAmount: number;
}

// ── API ───────────────────────────────────────────────────────────────────

export const purchaseRegisterApi = {
  /** Upload a GSTR-2 (purchase return) Excel file */
  upload: async (
    file: File,
    companyGstId: number,
    financialYear: string,
    taxPeriod: string,
  ): Promise<PurchaseRegisterUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<ApiResponse<PurchaseRegisterUploadResponse>>(
      `${BASE}/upload?companyGstId=${companyGstId}&financialYear=${financialYear}&taxPeriod=${taxPeriod}`,
      formData,
      { headers: { 'Content-Type': undefined }, timeout: 0 },
    );
    return data.data;
  },

  /** List all purchase register filings for a companyGST */
  getFilingsByCompanyGst: async (companyGstId: number): Promise<PurchaseRegisterFiling[]> => {
    const { data } = await apiClient.get<ApiResponse<PurchaseRegisterFiling[]>>(
      `${BASE}/filings/by-company-gst/${companyGstId}`,
    );
    return data.data;
  },

  /** Get a single filing */
  getFilingById: async (filingId: number): Promise<PurchaseRegisterFiling> => {
    const { data } = await apiClient.get<ApiResponse<PurchaseRegisterFiling>>(
      `${BASE}/filings/${filingId}`,
    );
    return data.data;
  },

  getB2b:    async (id: number): Promise<PrB2b[]>    => { const { data } = await apiClient.get<ApiResponse<PrB2b[]>>(`${BASE}/filings/${id}/b2b`); return data.data; },
  getB2bur:  async (id: number): Promise<PrB2bur[]>  => { const { data } = await apiClient.get<ApiResponse<PrB2bur[]>>(`${BASE}/filings/${id}/b2bur`); return data.data; },
  getCdnr:   async (id: number): Promise<PrCdnr[]>   => { const { data } = await apiClient.get<ApiResponse<PrCdnr[]>>(`${BASE}/filings/${id}/cdnr`); return data.data; },
  getCdnur:  async (id: number): Promise<PrCdnur[]>  => { const { data } = await apiClient.get<ApiResponse<PrCdnur[]>>(`${BASE}/filings/${id}/cdnur`); return data.data; },
  getAt:     async (id: number): Promise<PrAt[]>     => { const { data } = await apiClient.get<ApiResponse<PrAt[]>>(`${BASE}/filings/${id}/at`); return data.data; },
  getAtadj:  async (id: number): Promise<PrAtadj[]>  => { const { data } = await apiClient.get<ApiResponse<PrAtadj[]>>(`${BASE}/filings/${id}/atadj`); return data.data; },
  getExemp:  async (id: number): Promise<PrExemp[]>  => { const { data } = await apiClient.get<ApiResponse<PrExemp[]>>(`${BASE}/filings/${id}/exemp`); return data.data; },
  getHsnSum: async (id: number): Promise<PrHsnSum[]> => { const { data } = await apiClient.get<ApiResponse<PrHsnSum[]>>(`${BASE}/filings/${id}/hsn-sum`); return data.data; },
  getImpg:   async (id: number): Promise<PrImpg[]>   => { const { data } = await apiClient.get<ApiResponse<PrImpg[]>>(`${BASE}/filings/${id}/impg`); return data.data; },
  getImps:   async (id: number): Promise<PrImps[]>   => { const { data } = await apiClient.get<ApiResponse<PrImps[]>>(`${BASE}/filings/${id}/imps`); return data.data; },
  getItcr:   async (id: number): Promise<PrItcr[]>   => { const { data } = await apiClient.get<ApiResponse<PrItcr[]>>(`${BASE}/filings/${id}/itcr`); return data.data; },
};
