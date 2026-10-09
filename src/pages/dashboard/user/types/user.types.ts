export interface UserRequest {
  companyGstId: number;
  userName: string;
  userEmail: string;
  userPassword?: string;
  /** Role on companyGstId; the backend falls back to the GST's USER role. */
  roleId?: number;
}

export interface UserResponse {
  id: number;
  userName: string;
  userEmail: string;
  companyId?: number;
  companyName?: string;
  roleName?: string;
  isActive: boolean;
}
