// TODO: Replace mock data with useQuery(() => authApi.getMe())
// when the backend endpoint GET /auth/me is available.

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  initials: string;
};

const MOCK_USER: CurrentUser = {
  id: 'usr_mock_001',
  name: 'John Doe',
  email: 'john@company.com',
  initials: 'JD',
};

export function useCurrentUser() {
  // TODO: swap with useQuery(['auth', 'me'], authApi.getMe)
  return {
    data: MOCK_USER,
    isLoading: false,
    isError: false,
    error: null,
  } as const;
}
