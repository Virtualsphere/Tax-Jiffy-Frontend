import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleMappingApi } from '../api/roleMapping.api';
import type { RoleMappingRequest } from '../types/roleMapping.types';

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

export function useSaveRoleMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id?: number; data: RoleMappingRequest }) => {
      if (id) {
        return roleMappingApi.update(id, data);
      }
      return roleMappingApi.create(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ROLE_MAPPING_KEYS.byRoleAndGst(variables.data.roleId, variables.data.companyGstId)
      });
    },
  });
}
