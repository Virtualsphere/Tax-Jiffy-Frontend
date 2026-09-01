export interface CompanyGSTRequest {
  companyId: number;
  gstNumber: string;
}

/**
 * No startDate/endDate here on purpose — the subscription period (always 1 month) is computed
 * server-side. Sending client-supplied dates would let anyone grant themselves an arbitrarily
 * long subscription.
 */
export interface PurchaseSubscriptionRequest {
  subscriptionPlanId: number;
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
