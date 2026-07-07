import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { SubscriptionPlanResponse } from '../types/subscription.types';

const BASE_URL = '/subscription-plans';

export const subscriptionApi = {
  getAll: async (): Promise<SubscriptionPlanResponse[]> => {
    const response = await apiClient.get<ApiResponse<SubscriptionPlanResponse[]>>(BASE_URL);
    return response.data.data;
  },
};
