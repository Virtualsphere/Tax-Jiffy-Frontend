import { createContext, useContext, useState, type ReactNode } from 'react';

export type FYYear = {
  label: string; // e.g. "2023-24"
  startYear: number;
};

export const FY_YEARS: FYYear[] = [
  { label: '2025-26', startYear: 2025 },
  { label: '2024-25', startYear: 2024 },
  { label: '2023-24', startYear: 2023 },
  { label: '2022-23', startYear: 2022 },
  { label: '2021-22', startYear: 2021 },
  { label: '2020-21', startYear: 2020 },
];

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
