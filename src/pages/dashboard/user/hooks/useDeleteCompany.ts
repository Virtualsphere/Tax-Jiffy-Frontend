import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companyApi } from '../api/company.api';

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyId: number) => companyApi.delete(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-companies'] });
      queryClient.invalidateQueries({ queryKey: ['company-gsts'] });
    },
  });
}
