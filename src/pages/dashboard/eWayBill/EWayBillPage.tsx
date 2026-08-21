import { useCallback, useEffect, useMemo, useState } from 'react';
import { SimpleUploadUI } from '@/components/SimpleUploadUI/SimpleUploadUI';
import { PeriodSelector } from '@/components/PeriodSelector/PeriodSelector';
import { usePeriod, FY_YEARS } from '@/context/PeriodContext';
import { useCurrentEntity } from '@/hooks/useCurrentEntity';
import { toSyncDate } from '@/lib/period';
import { describeApiError } from '@/lib/api-error';
import { eWayBillApi } from './api/ewaybill.api';
import { EwaybillList } from './components/EwaybillList';
import type { EWayBillFiling, EWayBillRecord } from './types/ewaybill.types';

export function EWayBillPage() {
  const { data: currentEntity } = useCurrentEntity();
  const { selectedYear, selectedMonth, setSelectedYear, setSelectedMonth, periodLabel } = usePeriod();
  const [isSyncing, setIsSyncing] = useState(false);

  const syncDate = useMemo(
    () => toSyncDate(selectedYear.label, selectedMonth),
    [selectedYear, selectedMonth]
  );

  const [filing, setFiling] = useState<EWayBillFiling | null>(null);
  const [records, setRecords] = useState<EWayBillRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  /** Shows the rows of a filing already in hand, e.g. the one a sync or upload just returned. */
  const showFiling = useCallback(async (f: EWayBillFiling | null) => {
    setFiling(f);
    if (!f) {
      setRecords([]);
      return;
    }
    setLoadingRecords(true);
    setLoadError(null);
    try {
      setRecords(await eWayBillApi.getRecords(f.id));
    } catch (error) {
      console.error(error);
      setLoadError(describeApiError(error));
      setRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  }, []);

  const loadStoredData = useCallback(async () => {
    if (!currentEntity?.id) {
      setFiling(null);
      setRecords([]);
      return;
    }
    setLoadingRecords(true);
    setLoadError(null);
    try {
      const f = await eWayBillApi.getFiling(currentEntity.id, syncDate);
      setFiling(f);
      setRecords(f ? await eWayBillApi.getRecords(f.id) : []);
    } catch (error) {
      console.error(error);
      setLoadError(describeApiError(error));
      setFiling(null);
      setRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  }, [currentEntity, syncDate]);

  useEffect(() => {
    loadStoredData();
  }, [loadStoredData]);

  const handleUpload = useCallback(async (file: File, year: string, month: string) => {
    if (!currentEntity?.id) {
      alert('Please select an entity first.');
      return;
    }

    try {
      setIsSyncing(true);
      const f = await eWayBillApi.upload(file, currentEntity.id, toSyncDate(year, month));
      alert(`File ${file.name} uploaded successfully!`);
      await showFiling(f);
    } catch (error) {
      console.error(error);
      alert('Failed to upload E-Way Bill. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  }, [currentEntity, showFiling]);

  const handleSync = useCallback(async () => {
    if (!currentEntity?.id) {
      alert('Please select an entity first.');
      return;
    }

    try {
      setIsSyncing(true);
      const f = await eWayBillApi.sync({ companyGstId: currentEntity.id, date: syncDate });
      alert('E-Way Bill sync completed successfully!');
      await showFiling(f);
    } catch (error) {
      console.error(error);
      alert('Failed to sync E-Way Bill. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  }, [currentEntity, syncDate, showFiling]);

  const MAIN_TABS = ['Import', 'List', 'Reconciliation'] as const;
  type MainTab = typeof MAIN_TABS[number];
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('Import');

  /** A filing with no rows keeps the uploader in view rather than showing an empty table. */
  const hasStoredData = !!filing && records.length > 0;

  const storedSummary = useMemo(() => {
    if (!filing) return undefined;
    const count = `${records.length} e-way bill${records.length === 1 ? '' : 's'}`;
    const when = filing.syncedAt
      ? new Date(filing.syncedAt).toLocaleString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
        })
      : null;
    return [count, when ? `Last updated ${when}` : null, `Status: ${filing.syncStatus}`]
      .filter(Boolean)
      .join(' · ');
  }, [filing, records.length]);

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
          loadingExistingData={loadingRecords}
          hasExistingData={hasStoredData}
          existingSummary={storedSummary}
          existingError={loadError}
          existingData={
            <EwaybillList
              filing={filing}
              records={records}
              loading={false}
              periodLabel={periodLabel}
              embedded
            />
          }
        />
      )}
      {activeMainTab === 'List' && (
        <EwaybillList
          filing={filing}
          records={records}
          loading={loadingRecords}
          periodLabel={periodLabel}
        />
      )}
      {activeMainTab === 'Reconciliation' && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Reconciliation coming soon</div>
      )}
    </div>
  );
}
