import { useQuery } from '@tanstack/react-query';
import { companyApi } from '../api/company.api';

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: companyApi.getAll,
  });
}
