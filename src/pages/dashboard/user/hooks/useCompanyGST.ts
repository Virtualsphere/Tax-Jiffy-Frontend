import { useQuery } from '@tanstack/react-query';
import { companyGSTApi } from '../api/company-gst.api';

export function useCompanyGST(id: number) {
  return useQuery({
    queryKey: ['company-gst', id],
    queryFn: () => companyGSTApi.getById(id),
    enabled: !!id,
  });
}
