export interface CompanyProfileRequest {
  companyName: string;
  companyLogo: string;
}

export interface CompanyProfileResponse {
  id: number;
  companyName: string;
  companyLogo: string;
  isActive: boolean;
}
