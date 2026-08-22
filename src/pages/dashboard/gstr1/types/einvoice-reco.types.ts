export type MatchStatus = 'MATCHED' | 'VALUE_MISMATCH' | 'IN_SALE_REGISTER_ONLY' | 'IN_EINVOICE_ONLY';

export interface EInvoiceRecoSyncResponse {
  retPeriod: string;
  einvoiceRowsSynced: number;
  reconciledCount: number;
}

export interface SaleRegisterRow {
  id: number;
  gstinOfRecipient: string;
  receiverName?: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceValue: number;
  placeOfSupply?: string;
  reverseCharge?: string;
  invoiceType?: string;
  taxableValue: number;
  cessAmount?: number;
  isPaired: boolean;
  pairedIrn: string | null;
}

export interface EInvoiceRow {
  id: number;
  supplierGstin: string; // The counterparty's GSTIN (buyer)
  irn: string;
  ackNo?: number;
  ackDt?: string;
  docNum: string;
  docDate?: string;
  docType?: string;
  supplyType?: string;
  totInvAmt: number;
  irnStatus: string;
  ewbNo?: number;
  ewbDt?: string;
  ewbValidTill?: string;
  isPaired: boolean;
  pairedGstr1B2bId: number | null;
}

export interface ReconciliationRow {
  id: number;
  recipientGstin: string;
  invoiceNumber: string;
  matchStatus: MatchStatus;
  saleRegisterInvoiceValue: number | null;
  saleRegisterTaxableValue: number | null;
  einvoiceInvoiceValue: number | null;
  einvoiceIrn: string | null;
  einvoiceStatus: string | null;
}

/**
 * A row for the "E-Invoice Only" view — an e-invoice raised on the portal with no
 * matching entry in the uploaded sale register.
 *
 * Built from two backend sources: the IN_EINVOICE_ONLY rows of `/result`, plus the
 * unpaired rows of `/einvoices`. The second source matters because the backend only
 * runs reconciliation over B2B + INV e-invoices — SEZ/export supplies and credit/debit
 * notes never reach `/result`, so `/einvoices` is the only place they surface.
 */
export interface EInvoiceOnlyRow {
  rowKey: string;
  invoiceNumber: string;
  recipientGstin: string;
  matchStatus: string;
  einvoiceInvoiceValue: number | null;
  einvoiceIrn: string | null;
  einvoiceStatus: string | null;
  docDate: string | null;
  docType: string | null;
  supplyType: string | null;
  ewbNo: number | null;
}
