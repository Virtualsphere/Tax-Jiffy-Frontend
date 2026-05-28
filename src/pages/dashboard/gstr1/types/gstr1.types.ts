export type Gstr1DraftRow = {
  sr: string;
  label: string;
  sub: string;
  value: string;
  highlight: boolean;
};

export type Gstr1MatchStats = {
  matched: number;
  mismatched: number;
  missingInSystem: number;
};

export type Gstr1UploadResult = {
  fileName: string;
  fileSize: number;
  rows: number;
  validationErrors: string[];
};

export type Gstr1FilingResult = {
  arn: string;
  date: string;
  invoicesProcessed: number;
};

export type Gstr1DraftTab = 'Basic' | 'Outward' | 'Amendments' | 'Advanced' | 'Others';

export type Gstr1DraftData = {
  tabs: readonly Gstr1DraftTab[];
  tabBadges: Record<string, number | null>;
  rows: Gstr1DraftRow[];
  filingPeriodYear: string;
  filingPeriodMonth: string;
  outwardData?: Gstr1OutwardData;
  amendmentsData?: Gstr1AmendmentsData;
  advancedData?: Gstr1AdvancedData;
  othersData?: Gstr1OthersData;
};

export type Gstr1OutwardRecord = {
  gstin: string;
  invoiceNo: string;
  invoiceDate: string;
  invoiceValue: string;
  taxableValue: string;
  igst: string;
  cgst: string;
  sgst: string;
  cess: string;
  pos: string;
};

export type Gstr1OutwardTable4 = {
  section4A: Gstr1OutwardRecord[];
  section4B: Gstr1OutwardRecord[];
  section4C_ecommerceGstin: string;
  section4C: Gstr1OutwardRecord[];
  total: {
    invoiceValue: string;
    taxableValue: string;
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
  };
};

export type Gstr1OutwardTable5Record = {
  pos: string;
  invoiceNo: string;
  invoiceDate: string;
  invoiceValue: string;
  rate: string;
  taxableValue: string;
  igst: string;
  gstin?: string; // For 5B
};

export type Gstr1OutwardTable5 = {
  section5A: Gstr1OutwardTable5Record[];
  section5B_ecommerceGstin: string;
  section5B: Gstr1OutwardTable5Record[];
  total: {
    invoiceValue: string;
    taxableValue: string;
    igst: string;
  };
};

export type Gstr1OutwardTable6Record = {
  gstin: string;
  invoiceNo: string;
  invoiceDate: string;
  invoiceValue: string;
  sbNo: string;
  sbDate: string;
  rate: string;
  taxableValue: string;
  amt: string;
};

export type Gstr1OutwardTable6 = {
  section6A: Gstr1OutwardTable6Record[];
  section6B: Gstr1OutwardTable6Record[];
  section6C: Gstr1OutwardTable6Record[];
};

export type Gstr1OutwardTable7Record = {
  rate: string;
  taxableValue: string;
  integrated: string;
  central: string;
  state: string;
};

export type Gstr1OutwardTable7SubRecord = {
  gstin: string;
  rate: string;
  taxableValue: string;
  integrated: string;
  central: string;
  state: string;
};

export type Gstr1OutwardTable7StateRecord = {
  stateName: string;
  rate: string;
  taxableValue: string;
  integrated: string;
  central: string;
  state: string;
};

export type Gstr1OutwardTable7 = {
  section7A1: Gstr1OutwardTable7Record[];
  section7A2_ecommerceGstin: string;
  section7A2: Gstr1OutwardTable7SubRecord[];
  section7B1_pos: string;
  section7B1: Gstr1OutwardTable7StateRecord[];
  section7B2_ecommerceGstin: string;
  section7B2: Gstr1OutwardTable7SubRecord[];
};

export type Gstr1OutwardTable8Record = {
  label: string;
  nilRated: string;
  exempted: string;
  nonGst: string;
};

export type Gstr1OutwardTable8 = {
  section8A: Gstr1OutwardTable8Record;
  section8B: Gstr1OutwardTable8Record;
  section8C: Gstr1OutwardTable8Record;
  section8D: Gstr1OutwardTable8Record;
  total: Gstr1OutwardTable8Record;
};

export type Gstr1OutwardData = {
  table4: Gstr1OutwardTable4;
  table5: Gstr1OutwardTable5;
  table6: Gstr1OutwardTable6;
  table7: Gstr1OutwardTable7;
  table8: Gstr1OutwardTable8;
};

export type Gstr1AmendmentsTable9Record = {
  originalGstin: string;
  originalInvNo: string;
  originalInvDate: string;
  revisedGstin: string;
  revisedInvNo: string;
  revisedInvDate: string;
  sbNo: string;
  sbDate: string;
  value: string;
  rate: string;
  taxableValue: string;
  integratedTax?: string;
  centralTax?: string;
  stateTax?: string;
};

export type Gstr1AmendmentsTable9 = {
  section9A: Gstr1AmendmentsTable9Record[];
  section9B: Gstr1AmendmentsTable9Record[];
  section9C: Gstr1AmendmentsTable9Record[];
};

export type Gstr1AmendmentsTable10Record = {
  rate: string;
  taxableValue: string;
  integrated: string;
  central: string;
  state: string;
};

export type Gstr1AmendmentsTable10 = {
  section10A: Gstr1AmendmentsTable10Record[];
  section10A1_ecommerceGstin: string;
  section10A1: Gstr1AmendmentsTable10Record[];
  section10B_pos: string;
  section10B: Gstr1AmendmentsTable10Record[];
  section10B1_ecommerceGstin: string;
  section10B1: Gstr1AmendmentsTable10Record[];
};

export type Gstr1AmendmentsData = {
  table9: Gstr1AmendmentsTable9;
  table10: Gstr1AmendmentsTable10;
};

export type Gstr1AdvancedTable11Record = {
  rate: string;
  grossAdvance: string;
  pos: string;
  integrated: string;
  central: string;
  state: string;
  cess: string;
};

export type Gstr1AdvancedTable11AmendmentRecord = {
  month: string;
  amendmentRelatingTo: string;
  val11A1: string;
  val11A2: string;
  val11B1: string;
  val11B2: string;
};

export type Gstr1AdvancedTable11 = {
  section11A1: Gstr1AdvancedTable11Record[];
  section11A2: Gstr1AdvancedTable11Record[];
  section11B1: Gstr1AdvancedTable11Record[];
  section11B2: Gstr1AdvancedTable11Record[];
  amendments: Gstr1AdvancedTable11AmendmentRecord[];
};

export type Gstr1AdvancedData = {
  table11: Gstr1AdvancedTable11;
};

export type Gstr1OthersTable12Record = {
  hsn: string;
  description: string;
  uqc: string;
  totalQuantity: string;
  totalValue: string;
  taxableValue: string;
  integratedTax: string;
  centralTax: string;
  stateTax: string;
  cess: string;
};

export type Gstr1OthersTable12 = {
  records: Gstr1OthersTable12Record[];
  total: {
    totalQuantity: string;
    totalValue: string;
    taxableValue: string;
    integratedTax: string;
    centralTax: string;
    stateTax: string;
    cess: string;
  };
};

export type Gstr1OthersTable13Record = {
  natureOfDocument: string;
  from: string;
  to: string;
  totalNumber: string;
  cancelled: string;
  netIssued: string;
};

export type Gstr1OthersTable13 = {
  records: Gstr1OthersTable13Record[];
};

export type Gstr1OthersData = {
  table12: Gstr1OthersTable12;
  table13: Gstr1OthersTable13;
};
