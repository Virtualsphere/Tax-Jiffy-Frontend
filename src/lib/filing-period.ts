/**
 * Shared period-matching for uploaded filings.
 *
 * Every module that uploads a register for a tax period (GSTR-1, Purchase
 * Register, ...) needs the same question answered: "is there already a filing
 * on the server for the period the user is looking at?" Keeping that in one
 * place stops each page from inventing its own casing/trimming rules.
 */

export type PeriodFilingLike = {
  id: number;
  financialYear: string;
  taxPeriod: string;
  isActive?: boolean;
  createdDate?: string;
};

function samePeriod(filing: PeriodFilingLike, financialYear: string, month: string): boolean {
  return (
    filing.financialYear?.trim() === financialYear?.trim() &&
    filing.taxPeriod?.trim().toUpperCase() === month?.trim().toUpperCase()
  );
}

/**
 * The filing already on record for this financial year + month, if any.
 *
 * Active filings win over inactive ones, and among equals the most recently
 * created wins — re-uploading a period leaves the older rows behind, and the
 * user means the latest one.
 */
export function findFilingForPeriod<T extends PeriodFilingLike>(
  filings: readonly T[] | undefined,
  financialYear: string,
  month: string,
): T | undefined {
  if (!filings?.length || !financialYear || !month) return undefined;

  const matches = filings.filter((f) => samePeriod(f, financialYear, month));
  if (matches.length <= 1) return matches[0];

  return [...matches].sort((a, b) => {
    const activeDelta = Number(b.isActive ?? true) - Number(a.isActive ?? true);
    if (activeDelta !== 0) return activeDelta;

    const aTime = a.createdDate ? Date.parse(a.createdDate) : NaN;
    const bTime = b.createdDate ? Date.parse(b.createdDate) : NaN;
    if (Number.isFinite(aTime) && Number.isFinite(bTime) && aTime !== bTime) {
      return bTime - aTime;
    }
    return b.id - a.id;
  })[0];
}

/** "August 2025-26" — how a period is written in the already-uploaded notice. */
export function formatPeriodLabel(month: string, financialYear: string): string {
  if (!month) return financialYear ?? '';
  if (!financialYear) return month;
  return `${month} ${financialYear}`;
}
