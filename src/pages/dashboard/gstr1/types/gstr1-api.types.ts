// Backend response types mirroring the Swagger schema for GSTR-1 endpoints

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
