import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companyApi } from '../api/company.api';
import type { CompanyProfileRequest } from '../types/company.types';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export function useCreateCompany() {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  return useMutation({
    mutationFn: (data: CompanyProfileRequest) => companyApi.create(data),
    onSuccess: (data) => {
      if (user?.id) {
        const key = `my_created_companies_${user.id}`;
        const list = JSON.parse(localStorage.getItem(key) || '[]');
        if (!list.includes(data.id)) {
          list.push(data.id);
          localStorage.setItem(key, JSON.stringify(list));
        }
      }
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['my-companies'] });
    },
  });
}
