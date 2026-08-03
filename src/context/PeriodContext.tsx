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
  const [selectedYear, setSelectedYear] = useState<FYYear>(FY_YEARS[2]); // default: 2023-24
  const [selectedMonth, setSelectedMonth] = useState<string>('October');

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
