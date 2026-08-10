export interface EinvoiceFiling {
  id: number;
  retPeriod: string;
  syncStatus: string;
  syncedAt: string | null;
  createdDate: string;
  createdBy: number;
}

export interface EinvoiceIrn {
  id: number;
  supplierGstin: string | null;
  irn: string;
  ackNo: number | null;
  ackDt: string | null;
  docNum: string | null;
  docDate: string | null;
  docType: string | null;
  supplyType: string | null;
  totInvAmt: number | null;
  irnStatus: string | null;
  ewbNo: number | null;
  ewbDt: string | null;
  ewbValidTill: string | null;
  cnlDt: string | null;
  cnlRsn: string | null;
  cnlRem: string | null;
  remarks: string | null;
  source: 'SYNC' | 'MANUAL' | 'EXCEL';
  isPaired: boolean;
}
