export interface RolesRequest {
  roleName: string;
  description?: string;
}

export interface RolesResponse {
  id: number;
  roleName: string;
  description?: string;
  isActive: boolean;
}
