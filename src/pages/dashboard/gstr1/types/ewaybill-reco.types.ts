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

/**
 * A row for the "E-Way Bill Only" view — an e-way bill on record that no sale-register
 * invoice accounts for.
 *
 * Built from two backend sources: the IN_EWAYBILL_ONLY rows of `/result`, plus any e-way
 * bill in the period's `/ewaybill/filings/{id}/records` that the last reconciliation run
 * never covered. The second source matters because e-way bills are stored per sync date,
 * not per GST period — bills imported after the last Reconcile, or ones whose date the
 * backend's period filter skipped, never reach `/result` at all and the tab looked empty.
 */
export interface EwaybillOnlyRow {
  rowKey: string;
  ewbNo: number | null;
  docNo: string | null;
  docDate: string | null;
  ewbDate: string | null;
  recipientGstin: string | null;
  recipientName: string | null;
  ewaybillValue: number | null;
  status: string | null;
  validUpto: string | null;
  source: string | null;
  /**
   * Why the backend's Reconcile run left this bill out, mirroring its own filter:
   * OUT_OF_PERIOD — its doc/EWB date falls in another month, so the period filter drops it;
   * NO_DATE — neither date parses, so the filter can't place it in any month at all;
   * NOT_RECONCILED — in period, but still absent from the result (Reconcile not re-run since import);
   * null — reconciliation did cover it and found no invoice for it.
   */
  exclusionReason: 'OUT_OF_PERIOD' | 'NO_DATE' | 'NOT_RECONCILED' | null;
}
