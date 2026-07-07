import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companyGSTApi } from '../api/company-gst.api';
import type { PurchaseSubscriptionRequest } from '../types/company-gst.types';

export function usePurchaseSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PurchaseSubscriptionRequest }) => 
      companyGSTApi.purchase(id, data),
    onSuccess: () => {
      // Invalidate queries 
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}
