import { useCallback, useEffect, useMemo, useState } from 'react';
import { SimpleUploadUI } from '@/components/SimpleUploadUI/SimpleUploadUI';
import { PeriodSelector } from '@/components/PeriodSelector/PeriodSelector';
import { usePeriod, FY_YEARS } from '@/context/PeriodContext';
import { useCurrentEntity } from '@/hooks/useCurrentEntity';
import { toRetPeriod } from '@/lib/period';
import { eInvoiceApi } from './api/einvoice.api';
import { EinvoiceList } from './components/EinvoiceList';
import type { EinvoiceFiling, EinvoiceIrn } from './types/einvoice.types';

export function EInvoicePage() {
  const { data: currentEntity } = useCurrentEntity();
  const { selectedYear, selectedMonth, setSelectedYear, setSelectedMonth } = usePeriod();
  const [isSyncing, setIsSyncing] = useState(false);

  const retPeriod = useMemo(
    () => toRetPeriod(selectedYear.label, selectedMonth),
    [selectedYear, selectedMonth]
  );

  const [filing, setFiling] = useState<EinvoiceFiling | null>(null);
  const [irns, setIrns] = useState<EinvoiceIrn[]>([]);
  const [loadingIrns, setLoadingIrns] = useState(false);

  const loadInvoices = useCallback(async () => {
    if (!currentEntity?.id) {
      setFiling(null);
      setIrns([]);
      return;
    }
    setLoadingIrns(true);
    try {
      const f = await eInvoiceApi.getFiling(currentEntity.id, retPeriod);
      setFiling(f);
      setIrns(f ? await eInvoiceApi.getIrns(f.id) : []);
    } catch (error) {
      console.error(error);
      setFiling(null);
      setIrns([]);
    } finally {
      setLoadingIrns(false);
    }
  }, [currentEntity, retPeriod]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const handleUpload = useCallback(async (file: File, year: string, month: string) => {
    if (!currentEntity?.id) {
      alert('Please select an entity first.');
      return;
    }

    try {
      setIsSyncing(true); // Reusing the syncing state for simplicity, or we can use another state
      const period = toRetPeriod(year, month);

      await eInvoiceApi.upload(file, currentEntity.id, period);
      alert(`File ${file.name} uploaded successfully!`);
      await loadInvoices();
    } catch (error) {
      console.error(error);
      alert('Failed to upload E-Invoice. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  }, [currentEntity, loadInvoices]);

  const handleSync = useCallback(async () => {
    if (!currentEntity?.id) {
      alert('Please select an entity first.');
      return;
    }

    try {
      setIsSyncing(true);
      await eInvoiceApi.sync({ companyGstId: currentEntity.id, retPeriod });
      alert('E-Invoice sync completed successfully!');
      await loadInvoices();
    } catch (error) {
      console.error(error);
      alert('Failed to sync E-Invoice. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  }, [currentEntity, retPeriod, loadInvoices]);

  const MAIN_TABS = ['Import', 'List', 'Reconciliation'] as const;
  type MainTab = typeof MAIN_TABS[number];
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('Import');

  return (
    <div style={{ position: 'relative' }}>
      {isSyncing && (
        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, background: '#eef2ff', color: '#4f46e5', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold' }}>
          Syncing E-Invoice Data...
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
          title="E-Invoice"
          subtitle="Upload your E-Invoice data or Sync directly from GST portal"
          onUpload={handleUpload}
          onSync={handleSync}
        />
      )}
      {activeMainTab === 'List' && (
        <EinvoiceList filing={filing} irns={irns} loading={loadingIrns} retPeriod={retPeriod} />
      )}
      {activeMainTab === 'Reconciliation' && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Reconciliation coming soon</div>
      )}
    </div>
  );
}
