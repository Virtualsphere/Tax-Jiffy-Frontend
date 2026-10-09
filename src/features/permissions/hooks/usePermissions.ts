import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authStorage } from '@/features/auth/lib/auth-storage';
import { permissionsApi } from '../api/permissions.api';
import type { PermissionAction } from '../types/permissions.types';

export const MY_PERMISSIONS_KEY = ['my-permissions'] as const;

/**
 * The signed-in user's permissions on the active GST, from the role assigned to
 * them there. `can(page, action, screen?)` answers per page (any screen grants
 * it) or per screen; page and screen names are the ones in APP_PAGES.
 *
 * With no active GST nothing is gated — those screens (company picker, profile,
 * super-admin pages) are not GST-scoped. The backend enforces the same rules,
 * so this only decides what to show.
 */
export function usePermissions() {
  const companyGstId = authStorage.getActiveEntityId();

  const query = useQuery({
    queryKey: [...MY_PERMISSIONS_KEY, companyGstId],
    queryFn: () => permissionsApi.getMine(companyGstId as number),
    enabled: companyGstId !== null,
    staleTime: 60 * 1000,
    retry: false,
  });

  const data = query.data;
  const ungated = companyGstId === null;

  const can = useCallback(
    (page: string, action: PermissionAction = 'view', screen?: string): boolean => {
      if (ungated || data?.fullAccess) return true;
      if (!data) return false;
      return data.permissions.some(
        (p) => p.pageNumber === page && (screen === undefined || p.screenNumber === screen) && p[action],
      );
    },
    [data, ungated],
  );

  const canAny = useCallback(
    (pages: readonly string[], action: PermissionAction = 'view') => pages.some((page) => can(page, action)),
    [can],
  );

  return {
    can,
    canAny,
    /** True until the first answer arrives; gate on this to avoid flashing "no access". */
    isLoading: !ungated && query.isLoading,
    fullAccess: ungated || !!data?.fullAccess,
    roleName: data?.roleName ?? null,
  } as const;
}
