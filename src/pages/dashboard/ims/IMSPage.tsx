import { useCallback, useEffect, useMemo, useState } from 'react';
import { SimpleUploadUI } from '@/components/SimpleUploadUI/SimpleUploadUI';
import { PeriodSelector } from '@/components/PeriodSelector/PeriodSelector';
import { usePeriod, FY_YEARS } from '@/context/PeriodContext';
import { useCurrentEntity } from '@/hooks/useCurrentEntity';
import { toRetPeriod } from '@/lib/period';
import { describeApiError } from '@/lib/api-error';
import { imsApi } from './api/ims.api';
import { ImsInvoiceList } from './components/ImsInvoiceList';
import type { ImsFiling, ImsInvoice } from './types/ims.types';

export function IMSPage() {
  const { data: currentEntity } = useCurrentEntity();
  const { selectedYear, selectedMonth, setSelectedYear, setSelectedMonth } = usePeriod();
  const [isSyncing, setIsSyncing] = useState(false);

  const retPeriod = useMemo(
    () => toRetPeriod(selectedYear.label, selectedMonth),
    [selectedYear, selectedMonth]
  );

  const [filing, setFiling] = useState<ImsFiling | null>(null);
  const [invoices, setInvoices] = useState<ImsInvoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Re-runs whenever the entity or the selected return period changes, so a period that
  // was already uploaded shows its stored data instead of always opening on the uploader.
  const loadInvoices = useCallback(async () => {
    if (!currentEntity?.id) {
      setFiling(null);
      setInvoices([]);
      return;
    }
    setLoadingInvoices(true);
    setLoadError(null);
    try {
      const f = await imsApi.getFiling(currentEntity.id, retPeriod);
      setFiling(f);
      setInvoices(f ? await imsApi.getInvoices(f.id) : []);
    } catch (error) {
      console.error(error);
      setLoadError(describeApiError(error));
      setFiling(null);
      setInvoices([]);
    } finally {
      setLoadingInvoices(false);
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
      setIsSyncing(true);
      const period = toRetPeriod(year, month);

      await imsApi.upload(file, currentEntity.id, period);
      alert(`File ${file.name} uploaded successfully!`);
      await loadInvoices();
    } catch (error) {
      console.error(error);
      alert('Failed to upload IMS data. Please try again.');
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
      await imsApi.sync({ companyGstId: currentEntity.id, retPeriod, section: 'B2B', rtnTyp: 'GSTR1' });
      alert('IMS sync completed successfully!');
      await loadInvoices();
    } catch (error) {
      console.error(error);
      alert('Failed to sync IMS. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  }, [currentEntity, retPeriod, loadInvoices]);

  const MAIN_TABS = ['Import', 'List', 'Inward - IMS Reco'] as const;
  type MainTab = typeof MAIN_TABS[number];
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('Import');

  /** A filing with no rows is treated as "nothing uploaded yet" so the uploader stays in view. */
  const hasStoredData = !!filing && invoices.length > 0;

  const storedSummary = useMemo(() => {
    if (!filing) return undefined;
    const count = `${invoices.length} invoice${invoices.length === 1 ? '' : 's'}`;
    const when = filing.syncedAt
      ? new Date(filing.syncedAt).toLocaleString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
        })
      : null;
    return [count, when ? `Last updated ${when}` : null, `Status: ${filing.syncStatus}`]
      .filter(Boolean)
      .join(' · ');
  }, [filing, invoices.length]);

  return (
    <div style={{ position: 'relative' }}>
      {isSyncing && (
        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, background: '#eef2ff', color: '#4f46e5', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold' }}>
          Syncing IMS Data...
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
          title="IMS"
          subtitle="Upload your IMS data or Sync directly from GST portal"
          onUpload={handleUpload}
          onSync={handleSync}
          loadingExistingData={loadingInvoices}
          hasExistingData={hasStoredData}
          existingSummary={storedSummary}
          existingError={loadError}
          existingData={
            <ImsInvoiceList filing={filing} invoices={invoices} loading={false} retPeriod={retPeriod} embedded />
          }
        />
      )}
      {activeMainTab === 'List' && (
        <ImsInvoiceList filing={filing} invoices={invoices} loading={loadingInvoices} retPeriod={retPeriod} />
      )}
      {activeMainTab === 'Inward - IMS Reco' && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Inward - IMS Reco coming soon</div>
      )}
    </div>
  );
}
