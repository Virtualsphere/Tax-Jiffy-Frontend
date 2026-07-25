// Backend response types mirroring the Swagger schema for GSTR-1 endpoints

// ── Submit types ──────────────────────────────────────────────────────────

export type Gstr1SubmitRequest = {
  email: string;
  gstin: string;
  retPeriod: string;
  gstUsername: string;
  stateCd: string;
  ipAddress: string;
  txn: string;
  clientId: string;
  clientSecret: string;
  grossTurnover: number;
  currentGrossTurnover: number;
};

export type Gstr1SubmitResult = {
  success: boolean;
  httpStatus: number;
  message: string;
  arn: string;
  rawResponse: string;
};

export type Gstr1SubmitResponse = {
  success: boolean;
  message: string;
  data: Gstr1SubmitResult;
};

// Payload preview — mirrors the GET /submit-payload response data field
export type Gstr1ItemDetail = {
  rt: number;
  txval: number;
  iamt: number;
  camt: number;
  samt: number;
  csamt: number;
};

export type Gstr1Item = {
  num: number;
  itm_det: Gstr1ItemDetail;
};

export type Gstr1B2bInv = {
  inum: string;
  idt: string;
  val: number;
  pos: string;
  rchrg: string;
  etin: string;
  inv_typ: string;
  diff_percent: number;
  itms: Gstr1Item[];
  oinum?: string;
  oidt?: string;
};

export type Gstr1B2bEntry = { ctin: string; inv: Gstr1B2bInv[] };
export type Gstr1B2baEntry = { ctin: string; inv: Gstr1B2bInv[] };

export type Gstr1B2clInv = {
  inum: string;
  idt: string;
  val: number;
  inv_typ: string;
  etin: string;
  diff_percent: number;
  itms: Gstr1Item[];
  oinum?: string;
  oidt?: string;
};
export type Gstr1B2clEntry = { pos: string; inv: Gstr1B2clInv[] };
export type Gstr1B2claEntry = { pos: string; inv: Gstr1B2clInv[] };

export type Gstr1CdnrNote = {
  ntty: string;
  nt_num: string;
  nt_dt: string;
  p_gst: string;
  pos: string;
  rchrg: string;
  inv_typ: string;
  val: number;
  diff_percent: number;
  itms: Gstr1Item[];
  ont_num?: string;
  ont_dt?: string;
};
export type Gstr1CdnrEntry = { ctin: string; nt: Gstr1CdnrNote[] };
export type Gstr1CdnraEntry = { ctin: string; nt: Gstr1CdnrNote[] };

export type Gstr1B2csEntry = {
  sply_ty: string;
  diff_percent: number;
  rt: number;
  typ: string;
  etin: string;
  pos: string;
  txval: number;
  iamt: number;
  csamt: number;
};

export type Gstr1B2csaItem = {
  rt: number;
  txval: number;
  iamt: number;
  camt: number;
  samt: number;
  csamt: number;
};
export type Gstr1B2csaEntry = {
  omon: string;
  sply_ty: string;
  diff_percent: number;
  typ: string;
  etin: string;
  pos: string;
  itms: Gstr1B2csaItem[];
};

export type Gstr1ExpInv = {
  inum: string;
  idt: string;
  val: number;
  diff_percent: number;
  sbpcode: string;
  sbnum: string;
  sbdt: string;
  itms: { txval: number; rt: number; iamt: number; csamt: number }[];
  oinum?: string;
  oidt?: string;
};
export type Gstr1ExpEntry = { exp_typ: string; inv: Gstr1ExpInv[] };
export type Gstr1ExpaEntry = { exp_typ: string; inv: Gstr1ExpInv[] };

export type Gstr1HsnItem = {
  num: number;
  hsn_sc: string;
  desc: string;
  uqc: string;
  qty: number;
  rt: number;
  txval: number;
  iamt: number;
  csamt: number;
};

export type Gstr1NilInv = {
  sply_ty: string;
  expt_amt: number;
  nil_amt: number;
  ngsup_amt: number;
};

export type Gstr1TxpdItem = {
  rt: number;
  ad_amt: number;
  iamt: number;
  camt: number;
  samt: number;
  csamt: number;
};
export type Gstr1TxpdEntry = { pos: string; sply_ty: string; diff_percent: number; itms: Gstr1TxpdItem[] };
export type Gstr1TxpdaEntry = { pos: string; sply_ty: string; diff_percent: number; itms: Gstr1TxpdItem[]; omon: string };
export type Gstr1AtEntry = { pos: string; sply_ty: string; diff_percent: number; itms: Gstr1TxpdItem[] };
export type Gstr1AtaEntry = { pos: string; sply_ty: string; diff_percent: number; itms: Gstr1TxpdItem[]; omon: string };

export type Gstr1DocIssueDoc = { num: number; from: string; to: string; totnum: number; cancel: number; net_issue: number };
export type Gstr1DocIssueDet = { doc_num: number; docs: Gstr1DocIssueDoc[] };

export type Gstr1CdnurNote = {
  typ: string;
  ntty: string;
  nt_num: string;
  nt_dt: string;
  p_gst: string;
  pos: string;
  val: number;
  diff_percent: number;
  itms: Gstr1Item[];
};
export type Gstr1CdnuraNote = {
  ont_num: string;
  ont_dt: string;
  nt_num: string;
  nt_dt: string;
  ntty: string;
  typ: string;
  p_gst: string;
  inum: string;
  val: number;
  idt: string;
  diff_percent: number;
  itms: Gstr1Item[];
};

export type Gstr1SubmitPayload = {
  gstin: string;
  fp: string;
  gt: number;
  cur_gt: number;
  b2b?: Gstr1B2bEntry[];
  b2ba?: Gstr1B2baEntry[];
  b2cl?: Gstr1B2clEntry[];
  b2cla?: Gstr1B2claEntry[];
  cdnr?: Gstr1CdnrEntry[];
  cdnra?: Gstr1CdnraEntry[];
  b2cs?: Gstr1B2csEntry[];
  b2csa?: Gstr1B2csaEntry[];
  exp?: Gstr1ExpEntry[];
  expa?: Gstr1ExpaEntry[];
  hsn?: { data: Gstr1HsnItem[] };
  nil?: { inv: Gstr1NilInv[] };
  txpd?: Gstr1TxpdEntry[];
  txpda?: Gstr1TxpdaEntry[];
  at?: Gstr1AtEntry[];
  ata?: Gstr1AtaEntry[];
  doc_issue?: { doc_det: Gstr1DocIssueDet[] };
  cdnur?: Gstr1CdnurNote[];
  cdnura?: Gstr1CdnuraNote[];
};

export type Gstr1SubmitPayloadResponse = {
  success: boolean;
  message: string;
  data: Gstr1SubmitPayload;
};

export type Gstr1UploadResponse = {
  filingId: number;
  financialYear: string;
  taxPeriod: string;
  filingStatus: string;
  excelFilePath: string;
  totalRowsImported: number;
  b2bRows: number;
  b2baRows: number;
  b2clRows: number;
  b2claRows: number;
  b2csRows: number;
  b2csaRows: number;
  cdnrRows: number;
  cdnraRows: number;
  cdnurRows: number;
  cdnuraRows: number;
  expRows: number;
  expaRows: number;
  atRows: number;
  ataRows: number;
  exempRows: number;
  hsnB2bRows: number;
  hsnB2cRows: number;
  docsRows: number;
};

export type Gstr1SyncResponse = {
  filingId: number;
  financialYear: string;
  taxPeriod: string;
  status: string;
  totalRowsSynced: number;
  b2bRows: number;
  b2csRows: number;
  b2csaRows: number;
  b2claRows: number;
  cdnrRows: number;
  cdnurRows: number;
  cdnuraRows: number;
  expRows: number;
  expaRows: number;
  atRows: number;
  ataRows: number;
  exempRows: number;
  hsnB2bRows: number;
  hsnB2cRows: number;
};

export type Gstr1FilingRecord = {
  id: number;
  financialYear: string;
  taxPeriod: string;
  filingStatus: string;
  excelFilePath: string;
  originalFileName: string;
  isActive: boolean;
  createdDate: string;
  updatedDate: string;
};
