import { useQuery } from '@tanstack/react-query';
import { authStorage } from '@/features/auth/lib/auth-storage';
import { userApi } from '@/pages/dashboard/user/api/user.api';

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  initials: string;
  /** Empty until the profile resolves, or when the backend assigned no role. */
  role: string;
};

function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function useCurrentUser() {
  const authUser = authStorage.getUser();
  const userId = authUser ? Number(authUser.userId) : null;

  // The login response carries no role field, so the profile endpoint is the
  // only authoritative source. Shares a query key with useCurrentUserProfile
  // so both hooks resolve from one request.
  const profile = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => userApi.getById(userId as number),
    enabled: userId !== null && Number.isFinite(userId),
    staleTime: 5 * 60 * 1000,
  });

  const data: CurrentUser = authUser
    ? {
        id: String(authUser.userId),
        name: authUser.userName,
        email: authUser.email,
        initials: getInitials(authUser.userName),
        role: profile.data?.roleName ?? authUser.role ?? '',
      }
    : { id: '', name: '', email: '', initials: 'U', role: '' };

  return {
    data,
    isLoading: profile.isLoading,
    isError: profile.isError,
    error: profile.error,
  } as const;
}
