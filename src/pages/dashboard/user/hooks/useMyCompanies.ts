import { useQuery } from '@tanstack/react-query';
import { companyApi } from '../api/company.api';

/**
 * Fetches only the companies that belong to the currently authenticated user.
 * Calls GET /api/companies/my-companies — a single token-based request.
 * No userId, no intermediate calls, no client-side storage.
 */
export function useMyCompanies() {
  return useQuery({
    queryKey: ['my-companies'],
    queryFn: () => companyApi.getMyCompanies(),
    staleTime: 5 * 60 * 1000,
  });
}
