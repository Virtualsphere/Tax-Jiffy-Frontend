import { useQuery } from '@tanstack/react-query';
import { userApi } from '../api/user.api';

export function useCompanyUsers(companyId: number | undefined) {
  return useQuery({
    queryKey: ['company-users', companyId],
    queryFn: () => userApi.getByCompany(companyId!),
    enabled: !!companyId,
  });
}
