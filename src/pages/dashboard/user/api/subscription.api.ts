import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { SubscriptionPlanResponse } from '../types/subscription.types';

const BASE_URL = '/subscription-plans';

export interface CreateSubscriptionPlanRequest {
  name: string;
  userCount: number;
  transactionCount: number;
  planAmount: number;
  isActive: boolean;
}

export const subscriptionApi = {
  getAll: async (): Promise<SubscriptionPlanResponse[]> => {
    const response = await apiClient.get<ApiResponse<SubscriptionPlanResponse[]>>(BASE_URL);
    return response.data.data;
  },

  create: async (data: CreateSubscriptionPlanRequest): Promise<SubscriptionPlanResponse> => {
    const response = await apiClient.post<ApiResponse<SubscriptionPlanResponse>>(BASE_URL, data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<CreateSubscriptionPlanRequest>): Promise<SubscriptionPlanResponse> => {
    const response = await apiClient.put<ApiResponse<SubscriptionPlanResponse>>(`${BASE_URL}/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};
