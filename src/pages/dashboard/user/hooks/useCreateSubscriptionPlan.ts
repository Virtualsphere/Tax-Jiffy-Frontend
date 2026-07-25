import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi, type CreateSubscriptionPlanRequest } from '../api/subscription.api';

export function useCreateSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubscriptionPlanRequest) => subscriptionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    },
  });
}

export function useUpdateSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateSubscriptionPlanRequest> }) =>
      subscriptionApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    },
  });
}

export function useDeleteSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => subscriptionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    },
  });
}
