import { useCallback, useState } from 'react';
import { SimpleUploadUI } from '@/components/SimpleUploadUI/SimpleUploadUI';
import { PeriodSelector } from '@/components/PeriodSelector/PeriodSelector';
import { usePeriod, FY_YEARS } from '@/context/PeriodContext';

export function SaleRegisterPage() {
  const { selectedYear, selectedMonth, setSelectedYear, setSelectedMonth } = usePeriod();

  const handleUpload = useCallback((file: File, year: string, month: string) => {
    // API logic to be provided by user later
    console.log('Uploading Sale Register file:', file.name, year, month);
  }, []);

  const handleSync = useCallback(() => {
    // API logic to be provided by user later
    console.log('Syncing Sale Register');
  }, []);

  const MAIN_TABS = ['Import', 'List', '2B-Reco', '3B-Reco'] as const;
  type MainTab = typeof MAIN_TABS[number];
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('Import');

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '1.5rem' }}>
        <div className="global-main-tabs-container" style={{ marginBottom: 0 }}>
          <div className="global-main-tabs-wrapper">
            {MAIN_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`global-main-tab ${activeMainTab === tab ? 'global-main-tab-active' : ''}`}
                onClick={() => setActiveMainTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <PeriodSelector
          year={selectedYear.label}
          month={selectedMonth}
          onYearChange={(yLabel) => {
            const fy = FY_YEARS.find((f) => f.label === yLabel);
            if (fy) setSelectedYear(fy);
          }}
          onMonthChange={setSelectedMonth}
        />
      </div>

      {activeMainTab === 'Import' && (
        <SimpleUploadUI
          title="Sale Register"
          subtitle="Upload your Sale Register data"
          onUpload={handleUpload}
          onSync={handleSync}
        />
      )}
      {activeMainTab === 'List' && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>List coming soon</div>
      )}
      {activeMainTab === '2B-Reco' && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>2B-Reco coming soon</div>
      )}
      {activeMainTab === '3B-Reco' && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>3B-Reco coming soon</div>
      )}
    </div>
  );
}
