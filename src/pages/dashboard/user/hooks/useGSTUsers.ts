import { useQuery } from '@tanstack/react-query';
import { userApi } from '../api/user.api';

export function useGSTUsers(gstId: number | undefined) {
  return useQuery({
    queryKey: ['gst-users-mappings', gstId],
    queryFn: () => userApi.getMappingsByGST(gstId!),
    enabled: !!gstId,
  });
}
