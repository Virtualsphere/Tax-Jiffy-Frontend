import { createContext, useContext, useState, type ReactNode } from 'react';

export type FYYear = {
  label: string; // e.g. "2023-24"
  startYear: number;
};

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth(); // 0-indexed, so Jan=0, Mar=2, Apr=3
const currentFYStart = currentMonth >= 3 ? currentYear : currentYear - 1;

export const FY_YEARS: FYYear[] = [];
for (let y = currentFYStart; y >= 2017; y--) {
  FY_YEARS.push({
    label: `${y}-${(y + 1).toString().slice(-2)}`,
    startYear: y,
  });
}

export const MONTHS = [
  'April', 'May', 'June', 'July', 'August', 'September',
  'October', 'November', 'December', 'January', 'February', 'March',
];

/** Calendar order, so the index lines up with Date#getMonth(). */
const CALENDAR_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * A GST return is filed for a month only once that month has ended, so the
 * period a user wants on arrival is the previous calendar month.
 */
function getDefaultPeriod(): { year: FYYear; month: string } {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  // Jan–Mar still belong to the financial year that started the previous April.
  const fyStart = target.getMonth() >= 3 ? target.getFullYear() : target.getFullYear() - 1;

  return {
    year: FY_YEARS.find((fy) => fy.startYear === fyStart) ?? FY_YEARS[0],
    month: CALENDAR_MONTHS[target.getMonth()],
  };
}

export type PeriodContextValue = {
  selectedYear: FYYear;
  selectedMonth: string;
  setSelectedYear: (year: FYYear) => void;
  setSelectedMonth: (month: string) => void;
  /** Human-readable label e.g. "October 2023-24" */
  periodLabel: string;
};

const PeriodContext = createContext<PeriodContextValue | null>(null);

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [selectedYear, setSelectedYear] = useState<FYYear>(() => getDefaultPeriod().year);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => getDefaultPeriod().month);

  const periodLabel = `${selectedMonth} ${selectedYear.label}`;

  return (
    <PeriodContext.Provider
      value={{
        selectedYear,
        selectedMonth,
        setSelectedYear,
        setSelectedMonth,
        periodLabel,
      }}
    >
      {children}
    </PeriodContext.Provider>
  );
}

export function usePeriod(): PeriodContextValue {
  const ctx = useContext(PeriodContext);
  if (!ctx) throw new Error('usePeriod must be used inside PeriodProvider');
  return ctx;
}
