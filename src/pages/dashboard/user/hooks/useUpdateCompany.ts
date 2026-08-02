import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companyApi } from '../api/company.api';
import type { CompanyProfileRequest } from '../types/company.types';

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CompanyProfileRequest> }) => companyApi.update(id, data),
    onSuccess: (data) => {
      // Invalidate both lists and specific company
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['my-companies'] });
      queryClient.invalidateQueries({ queryKey: ['company', data.id] });
    },
  });
}
