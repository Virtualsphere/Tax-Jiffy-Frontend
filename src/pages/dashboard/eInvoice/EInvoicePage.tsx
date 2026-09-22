import { useCallback, useEffect, useMemo, useState } from 'react';
import { SimpleUploadUI } from '@/components/SimpleUploadUI/SimpleUploadUI';
import { MainTabsBar } from '@/components/MainTabsBar/MainTabsBar';
import { usePeriod } from '@/context/PeriodContext';
import { useCurrentEntity } from '@/hooks/useCurrentEntity';
import { toRetPeriod } from '@/lib/period';
import { describeApiError } from '@/lib/api-error';
import { eInvoiceApi } from './api/einvoice.api';
import { EinvoiceList } from './components/EinvoiceList';
import type { EinvoiceFiling, EinvoiceIrn } from './types/einvoice.types';

export function EInvoicePage() {
  const { data: currentEntity } = useCurrentEntity();
  const { selectedYear, selectedMonth } = usePeriod();
  const [isSyncing, setIsSyncing] = useState(false);

  const retPeriod = useMemo(
    () => toRetPeriod(selectedYear.label, selectedMonth),
    [selectedYear, selectedMonth]
  );

  const [filing, setFiling] = useState<EinvoiceFiling | null>(null);
  const [irns, setIrns] = useState<EinvoiceIrn[]>([]);
  const [loadingIrns, setLoadingIrns] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadInvoices = useCallback(async () => {
    if (!currentEntity?.id) {
      setFiling(null);
      setIrns([]);
      return;
    }
    setLoadingIrns(true);
    setLoadError(null);
    try {
      const f = await eInvoiceApi.getFiling(currentEntity.id, retPeriod);
      setFiling(f);
      setIrns(f ? await eInvoiceApi.getIrns(f.id) : []);
    } catch (error) {
      console.error(error);
      setLoadError(describeApiError(error));
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

  /** A filing with no rows is treated as "nothing uploaded yet" so the uploader stays in view. */
  const hasStoredData = !!filing && irns.length > 0;

  const storedSummary = useMemo(() => {
    if (!filing) return undefined;
    const count = `${irns.length} invoice${irns.length === 1 ? '' : 's'}`;
    const when = filing.syncedAt
      ? new Date(filing.syncedAt).toLocaleString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
        })
      : null;
    return [count, when ? `Last updated ${when}` : null, `Status: ${filing.syncStatus}`]
      .filter(Boolean)
      .join(' · ');
  }, [filing, irns.length]);

  return (
    <div style={{ position: 'relative' }}>
      {isSyncing && (
        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, background: '#eef2ff', color: '#4f46e5', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold' }}>
          Syncing E-Invoice Data...
        </div>
      )}

      <MainTabsBar tabs={MAIN_TABS} activeTab={activeMainTab} onTabChange={setActiveMainTab} />

      {activeMainTab === 'Import' && (
        <SimpleUploadUI
          title="E-Invoice"
          subtitle="Upload your E-Invoice data or Sync directly from GST portal"
          templateKey="einvoice"
          onUpload={handleUpload}
          onSync={handleSync}
          loadingExistingData={loadingIrns}
          hasExistingData={hasStoredData}
          existingSummary={storedSummary}
          existingError={loadError}
          existingData={
            <EinvoiceList filing={filing} irns={irns} loading={false} retPeriod={retPeriod} embedded />
          }
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
