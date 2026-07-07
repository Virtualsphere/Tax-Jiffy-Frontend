import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/user.api';

interface DeactivateVariables {
  mappingId: number;
  gstId: number;
}

export function useDeactivateMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mappingId }: DeactivateVariables) => userApi.deactivateMapping(mappingId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gst-users-mappings', variables.gstId] });
    },
  });
}
