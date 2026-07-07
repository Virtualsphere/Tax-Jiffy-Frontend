export interface CompanyGSTRequest {
  companyId: number;
  gstNumber: string;
}

export interface PurchaseSubscriptionRequest {
  subscriptionPlanId: number;
  startDate: string;
  endDate: string;
}

export interface CompanyGSTResponse {
  id: number;
  gstNumber: string;
  companyId: number;
  companyName: string;
  subscriptionPlanName: string;
  isPaymentDone: boolean;
  startDate: string;
  endDate: string;
  isActive: boolean;
}
