import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type {
  Gstr1FilingRecord,
  Gstr1SyncResponse,
  Gstr1UploadResponse,
} from '@/pages/dashboard/gstr1/types/gstr1-api.types';

const BASE = '/gstr1';

export const gstr1Api = {
  /**
   * Upload a GSTR-1 Excel file to the backend.
   * Returns a filingId used for all subsequent data fetch calls.
   */
  upload: async (
    file: File,
    companyGstId: number,
    financialYear: string,
    taxPeriod: string,
  ): Promise<Gstr1UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post<ApiResponse<Gstr1UploadResponse>>(
      `${BASE}/upload`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        params: { companyGstId, financialYear, taxPeriod },
      },
    );
    return data.data;
  },

  /**
   * Trigger a sync with the GST portal for a given period.
   */
  sync: async (body: {
    companyGstId: number;
    financialYear: string;
    taxPeriod: string;
  }): Promise<Gstr1SyncResponse> => {
    const { data } = await apiClient.post<ApiResponse<Gstr1SyncResponse>>(
      `${BASE}/sync`,
      body,
    );
    return data.data;
  },

  /**
   * Get all filings for a specific company GST number.
   */
  getFilingsByCompanyGst: async (companyGstId: number): Promise<Gstr1FilingRecord[]> => {
    const { data } = await apiClient.get<ApiResponse<Gstr1FilingRecord[]>>(
      `${BASE}/filings/by-company-gst/${companyGstId}`,
    );
    return data.data;
  },

  /**
   * Get the metadata for a specific filing.
   */
  getFilingDetail: async (filingId: number): Promise<Gstr1FilingRecord> => {
    const { data } = await apiClient.get<ApiResponse<Gstr1FilingRecord>>(
      `${BASE}/filings/${filingId}`,
    );
    return data.data;
  },

  /** Fetch B2B records for a filing */
  getB2b: async (filingId: number) => {
    const { data } = await apiClient.get(`${BASE}/filings/${filingId}/b2b`);
    return data.data;
  },

  /** Fetch B2C Small records for a filing */
  getB2cs: async (filingId: number) => {
    const { data } = await apiClient.get(`${BASE}/filings/${filingId}/b2cs`);
    return data.data;
  },

  /** Fetch B2C Large records for a filing */
  getB2cl: async (filingId: number) => {
    const { data } = await apiClient.get(`${BASE}/filings/${filingId}/b2cl`);
    return data.data;
  },

  /** Fetch HSN B2B summary for a filing */
  getHsnB2b: async (filingId: number) => {
    const { data } = await apiClient.get(`${BASE}/filings/${filingId}/hsn-b2b`);
    return data.data;
  },

  /** Fetch HSN B2C summary for a filing */
  getHsnB2c: async (filingId: number) => {
    const { data } = await apiClient.get(`${BASE}/filings/${filingId}/hsn-b2c`);
    return data.data;
  },

  /** Fetch documents summary for a filing */
  getDocs: async (filingId: number) => {
    const { data } = await apiClient.get(`${BASE}/filings/${filingId}/docs`);
    return data.data;
  },

  /** Fetch exports for a filing */
  getExp: async (filingId: number) => {
    const { data } = await apiClient.get(`${BASE}/filings/${filingId}/exp`);
    return data.data;
  },

  /** Fetch CDNR (Credit/Debit notes) for a filing */
  getCdnr: async (filingId: number) => {
    const { data } = await apiClient.get(`${BASE}/filings/${filingId}/cdnr`);
    return data.data;
  },

  /** Fetch exempt/nil-rated supplies for a filing */
  getExemp: async (filingId: number) => {
    const { data } = await apiClient.get(`${BASE}/filings/${filingId}/exemp`);
    return data.data;
  },
};
