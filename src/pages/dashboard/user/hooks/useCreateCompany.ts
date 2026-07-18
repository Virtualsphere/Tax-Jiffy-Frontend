import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companyApi } from '../api/company.api';
import type { CompanyProfileRequest } from '../types/company.types';

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CompanyProfileRequest) => companyApi.create(data),
    onSuccess: () => {
      // Invalidate so useMyCompanies re-fetches from the backend
      queryClient.invalidateQueries({ queryKey: ['my-companies'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}

