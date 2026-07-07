import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/user.api';
import type { UserRequest } from '../types/user.types';

export function useCreateSubUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserRequest) => userApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gst-users-mappings', variables.companyGstId] });
      // If we also want to invalidate company-users
      queryClient.invalidateQueries({ queryKey: ['company-users'] });
    },
  });
}
