import { authStorage } from '@/features/auth/lib/auth-storage';

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  initials: string;
};

export function useCurrentUser() {
  const authUser = authStorage.getUser();

  // Helper to extract initials
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const data: CurrentUser = authUser
    ? {
        id: String(authUser.userId),
        name: authUser.userName,
        email: authUser.email,
        initials: getInitials(authUser.userName),
      }
    : {
        id: 'usr_mock_001',
        name: 'Guest User',
        email: 'guest@example.com',
        initials: 'G',
      };

  return {
    data,
    isLoading: false,
    isError: false,
    error: null,
  } as const;
}
