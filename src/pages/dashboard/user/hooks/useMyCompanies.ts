import { useQuery } from '@tanstack/react-query';
import { companyApi } from '../api/company.api';

export function useMyCompanies() {
  return useQuery({
    queryKey: ['my-companies'],
    queryFn: companyApi.getMy,
  });
}
