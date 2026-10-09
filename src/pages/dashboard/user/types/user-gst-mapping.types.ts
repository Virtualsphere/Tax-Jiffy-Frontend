export interface UserGSTMappingRequest {
  userId: number;
  companyGstId: number;
}

export interface UserGSTMappingResponse {
  id: number;
  userId: number;
  userName: string;
  companyGstId: number;
  gstNumber: string;
  roleId: number | null;
  roleName: string;
  isAdmin: boolean;
  isActive: boolean;
}
