import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companyGSTApi } from '../api/company-gst.api';
import type { CompanyGSTRequest } from '../types/company-gst.types';

export function useCreateCompanyGST() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CompanyGSTRequest) => companyGSTApi.create(data),
    onSuccess: () => {
      // Invalidate relevant queries if needed
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}
