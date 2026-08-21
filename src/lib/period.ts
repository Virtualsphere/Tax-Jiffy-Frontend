const MONTH_TO_NUM: Record<string, string> = {
  January: '01', February: '02', March: '03', April: '04', May: '05', June: '06',
  July: '07', August: '08', September: '09', October: '10', November: '11', December: '12',
};

/**
 * Converts a fiscal-year label (e.g. "2026-27") + full calendar month name (e.g. "August")
 * into a GST-portal retPeriod string "MMYYYY". Jan/Feb/Mar belong to the FY's second calendar year.
 */
export function toRetPeriod(fyLabel: string, month: string): string {
  const startYear = parseInt(fyLabel.split('-')[0], 10);
  const monthNum = MONTH_TO_NUM[month] || '01';
  const actualYear = parseInt(monthNum, 10) <= 3 ? startYear + 1 : startYear;
  return `${monthNum}${actualYear}`;
}

/**
 * Converts a fiscal-year label (e.g. "2026-27") + full calendar month name (e.g. "June")
 * into the "YYYY-MM-01" sync date the e-way bill endpoints key their filings on.
 * Jan/Feb/Mar belong to the FY's second calendar year.
 */
export function toSyncDate(fyLabel: string, month: string): string {
  const startYear = parseInt(fyLabel.split('-')[0], 10);
  const monthNum = MONTH_TO_NUM[month] || '01';
  const actualYear = parseInt(monthNum, 10) <= 3 ? startYear + 1 : startYear;
  return `${actualYear}-${monthNum}-01`;
}
