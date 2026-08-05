import { useEffect, useRef, useState, useMemo } from 'react';
import styles from './PeriodSelector.module.css';
import { MONTHS } from '@/context/PeriodContext';

type Props = {
  year: string;
  month: string;
  onYearChange: (year: string) => void;
  onMonthChange: (month: string) => void;
  variant?: 'badge';
};

type MonthOption = {
  label: string;
  monthName: string;
  monthIndex: number;
  year: number;
  fyLabel: string;
  quarterIndex: number;
};

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function PeriodSelector({ year, month, onYearChange, onMonthChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  const options = useMemo(() => {
    const startYear = 2017;
    const startMonth = 6; 
    
    const now = new Date();
    const endYear = now.getFullYear();
    const endMonth = now.getMonth();

    const list: MonthOption[] = [];
    let currentY = startYear;
    let currentM = startMonth;

    while (currentY < endYear || (currentY === endYear && currentM <= endMonth)) {
      const fyStart = currentM >= 3 ? currentY : currentY - 1;
      const fyLabel = `${fyStart}-${(fyStart + 1).toString().slice(-2)}`;
      
      let quarterIndex = 0;
      if (currentM >= 3 && currentM <= 5) quarterIndex = 0; 
      else if (currentM >= 6 && currentM <= 8) quarterIndex = 1;
      else if (currentM >= 9 && currentM <= 11) quarterIndex = 2;
      else quarterIndex = 3;

      list.push({
        label: `${SHORT_MONTHS[currentM]} ${currentY}`,
        monthName: MONTHS[currentM],
        monthIndex: currentM,
        year: currentY,
        fyLabel,
        quarterIndex,
      });

      currentM++;
      if (currentM > 11) {
        currentM = 0;
        currentY++;
      }
    }
    
    return list;
  }, []);

  const grouped = useMemo(() => {
    const groups = new Map<string, MonthOption[]>();
    options.forEach(opt => {
      if (!groups.has(opt.fyLabel)) groups.set(opt.fyLabel, []);
      groups.get(opt.fyLabel)!.push(opt);
    });
    
    const sortedFYs = Array.from(groups.keys()).sort((a, b) => b.localeCompare(a));
    
    return sortedFYs.map(fy => ({
      fy,
      quarters: [3, 2, 1, 0].map(qIdx => {
        return {
          qIdx,
          months: groups.get(fy)!.filter(m => m.quarterIndex === qIdx).reverse()
        };
      }).filter(q => q.months.length > 0)
    }));
  }, [options]);

  const selectedOpt = options.find(o => o.fyLabel === year && o.monthName === month);
  const triggerLabel = selectedOpt ? selectedOpt.label : `${month} ${year}`;

  const handleSelect = (opt: MonthOption) => {
    onYearChange(opt.fyLabel);
    onMonthChange(opt.monthName);
    setIsOpen(false);
  };

  const getQuarterLabel = (qIdx: number, fyLabel: string) => {
    const startY = parseInt(fyLabel.split('-')[0], 10);
    switch (qIdx) {
      case 0: return { title: 'Q1', subtitle: `Apr \u2013 Jun ${startY}` };
      case 1: return { title: 'Q2', subtitle: `Jul \u2013 Sep ${startY}` };
      case 2: return { title: 'Q3', subtitle: `Oct \u2013 Dec ${startY}` };
      case 3: return { title: 'Q4', subtitle: `Jan \u2013 Mar ${startY + 1}` };
      default: return { title: '', subtitle: '' };
    }
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.triggerBtn}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={styles.calendarIcon}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className={styles.triggerLabel}>{triggerLabel}</span>
        <svg className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} width="12" height="12" viewBox="0 0 10 10" fill="none">
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.popover} role="dialog" aria-label="Select filing period">
          <div className={styles.popoverHeader}>
            <p className={styles.popoverTitle}>Select Month</p>
          </div>
          
          <div className={styles.scrollArea}>
            {grouped.map(group => (
              <div key={group.fy} className={styles.fyGroup}>
                <div className={styles.fyHeader}>
                  <span className={styles.fyTitle}>FY {group.fy}</span>
                  <span className={styles.fySubtitle}>
                    {`Apr ${group.fy.split('-')[0]} \u2013 Mar 20${group.fy.split('-')[1]}`}
                  </span>
                </div>
                
                <div className={styles.quartersList}>
                  {group.quarters.map(q => {
                    const qInfo = getQuarterLabel(q.qIdx, group.fy);
                    return (
                      <div key={q.qIdx} className={styles.quarterRow}>
                        <div className={styles.quarterInfo}>
                          <span className={styles.quarterTitle}>{qInfo.title}</span>
                          <span className={styles.quarterSubtitle}>{qInfo.subtitle}</span>
                        </div>
                        <div className={styles.monthsCol}>
                          {q.months.map(m => {
                            const isSelected = selectedOpt?.label === m.label;
                            return (
                              <label key={m.label} className={`${styles.monthOption} ${isSelected ? styles.monthOptionSelected : ''}`}>
                                <div className={`${styles.radioCircle} ${isSelected ? styles.radioCircleSelected : ''}`}>
                                  {isSelected && <div className={styles.radioDot} />}
                                </div>
                                <input
                                  type="radio"
                                  name="periodMonth"
                                  value={m.label}
                                  checked={isSelected}
                                  onChange={() => handleSelect(m)}
                                  className={styles.hiddenRadio}
                                />
                                <span>{m.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.footer}>
            <div className={styles.shortcut}>
              <span className={styles.keyBadge}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" ry="2" /><line x1="6" y1="16" x2="6" y2="16" /><line x1="10" y1="16" x2="14" y2="16" /><line x1="18" y1="16" x2="18" y2="16" /><line x1="6" y1="12" x2="6" y2="12" /><line x1="10" y1="12" x2="10" y2="12" /><line x1="14" y1="12" x2="14" y2="12" /><line x1="18" y1="12" x2="18" y2="12" /><line x1="6" y1="8" x2="6" y2="8" /><line x1="10" y1="8" x2="10" y2="8" /><line x1="14" y1="8" x2="14" y2="8" /><line x1="18" y1="8" x2="18" y2="8" /></svg>
              </span>
              <span className={styles.keyBadge}>↑↓</span>
              Navigate
            </div>
            <div className={styles.shortcut}>
              <span className={styles.keyBadge}>Enter</span>
              Select
            </div>
            <div className={styles.shortcut}>
              <span className={styles.keyBadge}>/</span>
              Search
            </div>
            <div className={styles.shortcut}>
              <span className={styles.keyBadge}>Esc</span>
              Close
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
