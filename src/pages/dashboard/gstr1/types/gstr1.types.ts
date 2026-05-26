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
};
