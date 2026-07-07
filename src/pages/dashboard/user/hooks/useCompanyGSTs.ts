import { useQuery } from '@tanstack/react-query';
import { companyGSTApi } from '../api/company-gst.api';

export function useCompanyGSTs(companyId: number) {
  return useQuery({
    queryKey: ['company-gsts', companyId],
    queryFn: () => companyGSTApi.getByCompany(companyId),
    enabled: !!companyId,
  });
}
