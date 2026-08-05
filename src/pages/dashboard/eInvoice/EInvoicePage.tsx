import { useCallback, useState } from 'react';
import { SimpleUploadUI } from '@/components/SimpleUploadUI/SimpleUploadUI';
import { usePeriod } from '@/context/PeriodContext';
import { useCurrentEntity } from '@/hooks/useCurrentEntity';
import { eInvoiceApi } from './api/einvoice.api';

export function EInvoicePage() {
  const { data: currentEntity } = useCurrentEntity();
  const { selectedYear, selectedMonth } = usePeriod();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleUpload = useCallback(async (file: File, year: string, month: string) => {
    if (!currentEntity?.id) {
      alert('Please select an entity first.');
      return;
    }

    try {
      setIsSyncing(true); // Reusing the syncing state for simplicity, or we can use another state
      const MONTH_MAP: Record<string, string> = {
        January: '01', February: '02', March: '03', April: '04', May: '05', June: '06',
        July: '07', August: '08', September: '09', October: '10', November: '11', December: '12'
      };
      const startYear = parseInt(year.split('-')[0], 10);
      const monthNumStr = MONTH_MAP[month] || '01';
      const m = parseInt(monthNumStr, 10);
      const actualYear = m <= 3 ? startYear + 1 : startYear;
      const retPeriod = `${monthNumStr}${actualYear}`;

      console.log('Uploading E-Invoice file:', file.name, retPeriod);
      await eInvoiceApi.upload(file, currentEntity.id, retPeriod);
      alert(`File ${file.name} uploaded successfully!`);
    } catch (error) {
      console.error(error);
      alert('Failed to upload E-Invoice. Please try again.');
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
      const MONTH_MAP: Record<string, string> = {
        January: '01', February: '02', March: '03', April: '04', May: '05', June: '06',
        July: '07', August: '08', September: '09', October: '10', November: '11', December: '12'
      };
      const yearLabel = selectedYear.label; // e.g., "2024-2025"
      const startYear = parseInt(yearLabel.split('-')[0], 10);
      const monthNumStr = MONTH_MAP[selectedMonth] || '01';
      const m = parseInt(monthNumStr, 10);
      // Months 01-03 belong to the next calendar year of the financial year
      const actualYear = m <= 3 ? startYear + 1 : startYear;
      const retPeriod = `${monthNumStr}${actualYear}`;

      console.log('Syncing E-Invoice for period:', retPeriod);
      await eInvoiceApi.sync({ companyGstId: currentEntity.id, retPeriod });
      alert('E-Invoice sync completed successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to sync E-Invoice. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  }, [currentEntity, selectedYear, selectedMonth]);

  const MAIN_TABS = ['Import', 'Reconciliation', 'Return'] as const;
  type MainTab = typeof MAIN_TABS[number];
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('Import');

  return (
    <div style={{ position: 'relative' }}>
      {isSyncing && (
        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, background: '#eef2ff', color: '#4f46e5', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold' }}>
          Syncing E-Invoice Data...
        </div>
      )}

      <div className="global-main-tabs-container">
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

      {activeMainTab === 'Import' && (
        <SimpleUploadUI
          title="E-Invoice"
          subtitle="Upload your E-Invoice data or Sync directly from GST portal"
          onUpload={handleUpload}
          onSync={handleSync}
        />
      )}
      {activeMainTab === 'Reconciliation' && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Reconciliation coming soon</div>
      )}
      {activeMainTab === 'Return' && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Return coming soon</div>
      )}
    </div>
  );
}
