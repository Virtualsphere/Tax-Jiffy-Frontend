export type EwbMatchStatus = 'MATCHED' | 'VALUE_MISMATCH' | 'IN_SALE_REGISTER_ONLY' | 'IN_EWAYBILL_ONLY';

export interface EwaybillReconciliationRow {
  id: number;
  ewbNo: number | null;
  docNo: string | null;
  recipientGstin: string | null;
  /** Comma-joined GSTR-1 invoice numbers matched into this e-way bill's bucket. */
  invoiceNumbers: string | null;
  ewaybillValue: number | null;
  /** Sum of the matched invoices' values — what the bucket has been "filled" with so far. */
  saleRegisterValue: number | null;
  /** ewaybillValue - saleRegisterValue. Zero means the bucket is fully accounted for. */
  difference: number | null;
  matchStatus: EwbMatchStatus;
}
