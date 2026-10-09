export type PermissionAction = 'view' | 'add' | 'edit' | 'delete';

export interface ScreenPermission {
  pageNumber: string;
  screenNumber: string;
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
}

export interface MyPermissionsResponse {
  companyGstId: number;
  /** Super admin, company owner, or GST admin — every check passes. */
  fullAccess: boolean;
  roleId: number | null;
  roleName: string | null;
  permissions: ScreenPermission[];
}
