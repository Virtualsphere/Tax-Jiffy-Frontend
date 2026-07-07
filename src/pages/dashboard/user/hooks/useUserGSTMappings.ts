import { useQuery } from '@tanstack/react-query';
import { userGSTMappingApi } from '../api/user-gst-mapping.api';

export function useUserGSTMappings(userId: number | undefined) {
  return useQuery({
    queryKey: ['user-gst-mappings', userId],
    queryFn: () => userGSTMappingApi.getByUser(userId!),
    enabled: !!userId,
  });
}
