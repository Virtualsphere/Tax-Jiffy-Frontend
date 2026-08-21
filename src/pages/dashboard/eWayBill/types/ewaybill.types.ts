/** Mirrors the backend `EwaybillFiling` schema. */
export interface EWayBillFiling {
  id: number;
  syncDate: string;
  syncStatus: string;
  syncedAt: string | null;
  createdDate: string;
  createdBy: number;
}

/** Mirrors the backend `EwaybillRecord` schema returned by /ewaybill/filings/{id}/records. */
export interface EWayBillRecord {
  id: number;
  ewbNo: number | null;
  ewbDate: string | null;
  genMode: string | null;
  userGstin: string | null;
  supplyType: string | null;
  subSupplyType: string | null;
  docType: string | null;
  docNo: string | null;
  docDate: string | null;
  fromGstin: string | null;
  fromTrdName: string | null;
  fromPlace: string | null;
  fromPincode: number | null;
  fromStateCode: number | null;
  toGstin: string | null;
  toTrdName: string | null;
  toPlace: string | null;
  toPincode: number | null;
  toStateCode: number | null;
  totalValue: number | null;
  totInvValue: number | null;
  cgstValue: number | null;
  sgstValue: number | null;
  igstValue: number | null;
  cessValue: number | null;
  transporterId: string | null;
  transporterName: string | null;
  status: string | null;
  validUpto: string | null;
  extendedTimes: number | null;
  rejectStatus: string | null;
  source: string | null;
  createdDate: string;
  createdBy: number;
}
