export interface ImsFiling {
  id: number;
  retPeriod: string;
  syncStatus: string;
  syncedAt: string | null;
  createdDate: string;
  createdBy: number;
}

export interface ImsInvoice {
  id: number;
  gstrSource: string | null;
  section: string;
  supplierGstin: string | null;
  recipientGstin: string | null;
  ecommerceGstin: string | null;
  originalInvoiceNumber: string | null;
  originalInvoiceDate: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  invoiceValue: number | null;
  placeOfSupply: string | null;
  invoiceType: string | null;
  reverseCharge: string | null;
  rate: number | null;
  taxableValue: number;
  integratedTax: number;
  centralTax: number;
  stateUtTax: number;
  cess: number;
  imsAction: string | null;
  remarks: string | null;
  source: 'SYNC' | 'MANUAL' | 'EXCEL';
  createdDate: string;
}
