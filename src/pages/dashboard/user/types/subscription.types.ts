export interface SubscriptionPlanResponse {
  id: number;
  name: string;
  userCount: number;
  transactionCount: number;
  planAmount: number;
  isActive: boolean;
}
