import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/user.api';

interface UpdateUserRoleVariables {
  mappingId: number;
  roleId: number;
  gstId: number;
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mappingId, roleId }: UpdateUserRoleVariables) => userApi.updateMappingRole(mappingId, roleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gst-users-mappings', variables.gstId] });
    },
  });
}
