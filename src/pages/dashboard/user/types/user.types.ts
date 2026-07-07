export interface UserRequest {
  companyGstId: number;
  userName: string;
  userEmail: string;
  userPassword?: string;
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
