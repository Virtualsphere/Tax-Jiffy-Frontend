import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { CompanyProfileRequest, CompanyProfileResponse } from '../types/company.types';

const BASE_URL = '/companies';

export const companyApi = {
  create: async (data: CompanyProfileRequest): Promise<CompanyProfileResponse> => {
    const response = await apiClient.post<ApiResponse<CompanyProfileResponse>>(BASE_URL, data);
    return response.data.data;
  },

  /**
   * Returns only the companies belonging to the currently authenticated user.
   * Hits GET /api/companies/my-companies (token-based — no userId needed).
   */
  getMyCompanies: async (): Promise<CompanyProfileResponse[]> => {
    const response = await apiClient.get<ApiResponse<CompanyProfileResponse[]>>(`${BASE_URL}/my-companies`);
    return response.data.data;
  },

  /**
   * Admin-only: returns all companies in the system.
   */
  getAll: async (): Promise<CompanyProfileResponse[]> => {
    const response = await apiClient.get<ApiResponse<CompanyProfileResponse[]>>(BASE_URL);
    return response.data.data;
  },

  getById: async (id: number): Promise<CompanyProfileResponse> => {
    const response = await apiClient.get<ApiResponse<CompanyProfileResponse>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  /**
   * Fetch multiple companies by their IDs (for a user who belongs to several).
   * Each call hits GET /api/companies/{id}.
   */
  getByIds: async (ids: number[]): Promise<CompanyProfileResponse[]> => {
    const results = await Promise.all(
      ids.map((id) =>
        apiClient
          .get<ApiResponse<CompanyProfileResponse>>(`${BASE_URL}/${id}`)
          .then((r) => r.data.data),
      ),
    );
    return results;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  update: async (id: number, data: Partial<CompanyProfileRequest>): Promise<CompanyProfileResponse> => {
    const response = await apiClient.put<ApiResponse<CompanyProfileResponse>>(`${BASE_URL}/${id}`, data);
    return response.data.data;
  },
};
