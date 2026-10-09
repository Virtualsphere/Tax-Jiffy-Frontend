import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MY_PERMISSIONS_KEY, type ScreenPermission } from '@/features/permissions';
import { roleMappingApi } from '../api/roleMapping.api';

export const ROLE_MAPPING_KEYS = {
  all: ['roleMappings'] as const,
  byRoleAndGst: (roleId: number, companyGstId: number) => [...ROLE_MAPPING_KEYS.all, { roleId, companyGstId }] as const,
};

export function useRoleMappings(roleId: number | '', companyGstId: number | '') {
  return useQuery({
    queryKey: ROLE_MAPPING_KEYS.byRoleAndGst(Number(roleId), Number(companyGstId)),
    queryFn: () => roleMappingApi.getByRoleAndGST(Number(roleId), Number(companyGstId)),
    enabled: !!roleId && !!companyGstId,
  });
}

export function useSaveRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: number; permissions: ScreenPermission[] }) =>
      roleMappingApi.replaceForRole(roleId, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLE_MAPPING_KEYS.all });
      // Editing a role can change what the current user may do.
      queryClient.invalidateQueries({ queryKey: MY_PERMISSIONS_KEY });
    },
  });
}
