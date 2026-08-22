// The "uploaded GSTR-2B data" this page reconciles IS the purchase-register upload
// (see @/pages/dashboard/purchaseRegister/api/purchaseRegisterApi — PurchaseRegisterFiling,
// PrB2b). There is no separate GSTR-2B filing/invoice entity — only the reconciliation
// result shape below, which is specific to this page.

export type Gstr2bMatchStatus =
  | 'MATCHED'
  | 'ROUNDING_DIFFERENCE'
  | 'TAXABLE_VALUE_DIFFERS'
  | 'TAX_AMOUNT_DIFFERS'
  | 'TAX_HEAD_DIFFERS_POS'
  | 'ONLY_IN_2B'
  | 'ONLY_IN_IMS';

export interface Gstr2bReconciliationRow {
  id: string;
  /** Id of the underlying purchase-register (Gstr2B2b) row — null for an IMS-only row. */
  gstr2bInvoiceId: number | null;
  imsInvoiceId: number | null;
  supplierGstin: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  itcAvailability: string | null;
  matchStatus: Gstr2bMatchStatus;
  gstr2bTaxableValue: number;
  gstr2bIgst: number;
  gstr2bCgst: number;
  gstr2bSgst: number;
  gstr2bCess: number;
  gstr2bTotalTax: number;
  imsTaxableValue: number;
  imsIgst: number;
  imsCgst: number;
  imsSgst: number;
  imsCess: number;
  imsTotalTax: number;
  deltaTaxable: number;
  deltaIgst: number;
  deltaCgst: number;
  deltaSgst: number;
  deltaCess: number;
  deltaTotal: number;
  atRisk: number;
  unclaimed: number;
  edited: boolean;
  reconciliationAction: 'ACCEPT' | 'REJECT' | 'PENDING';
  remarks: string | null;
}

export interface Gstr2bInvoiceUpdateRequest {
  taxableValue?: number;
  rate?: number;
  integratedTaxPaid?: number;
  centralTaxPaid?: number;
  stateUtTaxPaid?: number;
  cessPaid?: number;
  reconciliationAction?: 'ACCEPT' | 'REJECT' | 'PENDING';
  remarks?: string;
}
