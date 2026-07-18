export interface RoleMappingRequest {
  roleId: number;
  companyId: number;
  companyGstId: number;
  pageNumber: string; // Used as page name in backend DTO
  screenNumber: string; // Used as screen name in backend DTO
  add: boolean;
  edit: boolean;
  view: boolean;
  delete: boolean;
}

export interface RoleMappingResponse {
  id: number;
  roleId: number;
  roleName: string;
  companyId: number;
  companyName: string;
  companyGstId: number;
  gstNumber: string;
  pageNumber: string;
  screenNumber: string;
  add: boolean;
  edit: boolean;
  view: boolean;
  delete: boolean;
  createdDate: string;
}
