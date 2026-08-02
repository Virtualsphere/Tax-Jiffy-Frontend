import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companyGSTApi } from '../api/company-gst.api';
import type { CompanyGSTRequest } from '../types/company-gst.types';

export function useUpdateCompanyGST() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CompanyGSTRequest> }) => companyGSTApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['company-gsts', data.companyId] });
      queryClient.invalidateQueries({ queryKey: ['company-gst', data.id] });
      queryClient.invalidateQueries({ queryKey: ['user-gst-mappings'] });
    },
  });
}
