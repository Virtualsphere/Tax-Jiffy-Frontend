import type { CSSProperties } from 'react';
import { PeriodSelector } from '@/components/PeriodSelector/PeriodSelector';
import { usePeriod, FY_YEARS } from '@/context/PeriodContext';

export type MainTabsBarPeriod = {
  year: string;
  month: string;
  onYearChange: (year: string) => void;
  onMonthChange: (month: string) => void;
};

export type MainTabsBarProps<T extends string> = {
  tabs: readonly T[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  /** Wire the selector to something other than the shared period context. */
  period?: MainTabsBarPeriod;
  style?: CSSProperties;
};

/** Standard page header row: main tabs on the left, period selector on the top right. */
export function MainTabsBar<T extends string>({ tabs, activeTab, onTabChange, period, style }: MainTabsBarProps<T>) {
  const { selectedYear, selectedMonth, setSelectedYear, setSelectedMonth } = usePeriod();

  const periodProps: MainTabsBarPeriod = period ?? {
    year: selectedYear.label,
    month: selectedMonth,
    onYearChange: (yLabel) => {
      const fy = FY_YEARS.find((f) => f.label === yLabel);
      if (fy) setSelectedYear(fy);
    },
    onMonthChange: setSelectedMonth,
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '1.5rem', ...style }}>
      <div className="global-main-tabs-container" style={{ marginBottom: 0 }}>
        <div className="global-main-tabs-wrapper">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`global-main-tab ${activeTab === tab ? 'global-main-tab-active' : ''}`}
              onClick={() => onTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <PeriodSelector {...periodProps} />
    </div>
  );
}
