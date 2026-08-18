import { useCallback, useState } from 'react';
import { SimpleUploadUI } from '@/components/SimpleUploadUI/SimpleUploadUI';
import { PeriodSelector } from '@/components/PeriodSelector/PeriodSelector';
import { usePeriod, FY_YEARS } from '@/context/PeriodContext';
import { useCurrentEntity } from '@/hooks/useCurrentEntity';
import { eWayBillApi } from './api/ewaybill.api';

export function EWayBillPage() {
  const { data: currentEntity } = useCurrentEntity();
  const { selectedYear, selectedMonth, setSelectedYear, setSelectedMonth } = usePeriod();
  const [isSyncing, setIsSyncing] = useState(false);

  // We need a syncDate format. For this example we'll use YYYY-MM-01.
  // The backend might expect a different format for syncDate.
  const getSyncDate = (year: string, month: string) => {
    const MONTH_MAP: Record<string, string> = {
      January: '01', February: '02', March: '03', April: '04', May: '05', June: '06',
      July: '07', August: '08', September: '09', October: '10', November: '11', December: '12'
    };
    const startYear = parseInt(year.split('-')[0], 10);
    const monthNumStr = MONTH_MAP[month] || '01';
    const m = parseInt(monthNumStr, 10);
    const actualYear = m <= 3 ? startYear + 1 : startYear;
    return `${actualYear}-${monthNumStr}-01`;
  };

  const handleUpload = useCallback(async (file: File, year: string, month: string) => {
    if (!currentEntity?.id) {
      alert('Please select an entity first.');
      return;
    }

    try {
      setIsSyncing(true);
      const syncDate = getSyncDate(year, month);

      console.log('Uploading E-Way Bill file:', file.name, syncDate);
      await eWayBillApi.upload(file, currentEntity.id, syncDate);
      alert(`File ${file.name} uploaded successfully!`);
    } catch (error) {
      console.error(error);
      alert('Failed to upload E-Way Bill. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  }, [currentEntity]);

  const handleSync = useCallback(async () => {
    if (!currentEntity?.id) {
      alert('Please select an entity first.');
      return;
    }

    try {
      setIsSyncing(true);
      const syncDate = getSyncDate(selectedYear.label, selectedMonth);

      console.log('Syncing E-Way Bill for date:', syncDate);
      await eWayBillApi.sync({ companyGstId: currentEntity.id, syncDate });
      alert('E-Way Bill sync completed successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to sync E-Way Bill. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  }, [currentEntity, selectedYear, selectedMonth]);

  const MAIN_TABS = ['Import', 'List', 'Reconciliation'] as const;
  type MainTab = typeof MAIN_TABS[number];
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('Import');

  return (
    <div style={{ position: 'relative' }}>
      {isSyncing && (
        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, background: '#eef2ff', color: '#4f46e5', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold' }}>
          Syncing E-Way Bill Data...
        </div>
      )}

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
          title="E-Way Bill"
          subtitle="Upload your E-Way Bill data or Sync directly from GST portal"
          onUpload={handleUpload}
          onSync={handleSync}
        />
      )}
      {activeMainTab === 'List' && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>List coming soon</div>
      )}
      {activeMainTab === 'Reconciliation' && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Reconciliation coming soon</div>
      )}
    </div>
  );
}
