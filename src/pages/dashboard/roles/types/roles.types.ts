export interface RolesRequest {
  roleName: string;
  description?: string;
  companyId: number;
  companyGstId: number;
}

export interface RolesResponse {
  id: number;
  roleName: string;
  description?: string;
  isActive: boolean;
}
