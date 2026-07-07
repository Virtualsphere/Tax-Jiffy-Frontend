import { useQuery } from '@tanstack/react-query';
import { subscriptionApi } from '../api/subscription.api';

export function useSubscriptions() {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: subscriptionApi.getAll,
  });
}
