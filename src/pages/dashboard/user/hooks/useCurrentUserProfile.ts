import { useQuery } from '@tanstack/react-query';
import { userApi } from '../api/user.api';
import { useCurrentUser } from '@/hooks/useCurrentUser';

/**
 * Fetches the full backend profile of the currently logged-in user.
 * Returns companyId, roleName, isActive etc. from GET /api/users/{id}.
 */
export function useCurrentUserProfile() {
  const { data: authUser } = useCurrentUser();
  const userId = authUser?.id ? Number(authUser.id) : undefined;

  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => userApi.getById(userId!),
    enabled: !!userId && !isNaN(userId),
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
}
