import { useEffect, useRef, useState } from 'react';
import styles from './PeriodSelector.module.css';

export type FYYear = { label: string; startYear: number };

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

type Props = {
  year: string;
  month: string;
  onYearChange: (year: string) => void;
  onMonthChange: (month: string) => void;
  /** Visual variant: 'badge' (default) renders inline pill-badges that open a popover */
  variant?: 'badge';
};

export function PeriodSelector({ year, month, onYearChange, onMonthChange }: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {/* Trigger: the existing year + month badges become buttons */}
      <button
        type="button"
        className={styles.yearBadge}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Change financial year"
      >
        {year}
        <svg className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <button
        type="button"
        className={styles.monthBadge}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Change month"
      >
        {month}
        <svg className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Popover */}
      {open && (
        <div className={styles.popover} role="dialog" aria-label="Select filing period">
          <p className={styles.popoverTitle}>Select Filing Period</p>

          {/* Financial Year */}
          <div className={styles.section}>
            <p className={styles.sectionLabel}>FINANCIAL YEAR</p>
            <div className={styles.yearGrid}>
              {FY_YEARS.map((fy) => (
                <button
                  key={fy.label}
                  type="button"
                  className={`${styles.optionBtn} ${year === fy.label ? styles.optionBtnActive : ''}`}
                  onClick={() => onYearChange(fy.label)}
                >
                  {fy.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.divider} />

          {/* Month */}
          <div className={styles.section}>
            <p className={styles.sectionLabel}>MONTH</p>
            <div className={styles.monthGrid}>
              {MONTHS.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`${styles.optionBtn} ${month === m ? styles.optionBtnActive : ''}`}
                  onClick={() => { onMonthChange(m); setOpen(false); }}
                >
                  {m.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
