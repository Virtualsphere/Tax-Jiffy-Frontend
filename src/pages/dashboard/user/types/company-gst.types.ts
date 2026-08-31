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
  subscriptionPlanId: number | null;
  subscriptionPlanName: string | null;
  planAmount: number | null;
  planUserCount: number | null;
  planTransactionCount: number | null;
  isPaymentDone: boolean;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
}
