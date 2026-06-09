export interface RegistrationDetails {
  gstin: string;
  legalName: string;
  year: string;
  month: string;
  tradeName: string;
  generationDate: string;
}

export interface ItcTableRow {
  section: string;
  heading: string;
  gstr3bTable: string;
  igst: number;
  cgst: number;
  sgst: number;
  cess: number;
}

export interface Gstr2bData {
  registrationDetails: RegistrationDetails;
  itcAvailable: {
    creditMayBeClaimed: ItcTableRow[];
    creditShallBeReversed: ItcTableRow[];
  };
  itcUnavailable: {
    itcNotAvailable: ItcTableRow[];
    itcReversal: ItcTableRow[];
  };
}
