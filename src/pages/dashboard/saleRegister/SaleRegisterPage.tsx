import { useCallback, useState } from 'react';
import { SimpleUploadUI } from '@/components/SimpleUploadUI/SimpleUploadUI';
import { MainTabsBar } from '@/components/MainTabsBar/MainTabsBar';

export function SaleRegisterPage() {
  const handleUpload = useCallback((file: File, year: string, month: string) => {
    // API logic to be provided by user later
    console.log('Uploading Sale Register file:', file.name, year, month);
  }, []);

  const handleSync = useCallback(() => {
    // API logic to be provided by user later
    console.log('Syncing Sale Register');
  }, []);

  const MAIN_TABS = ['Import', 'List', 'E-Invoice Reco', 'E-way Bill Reco'] as const;
  type MainTab = typeof MAIN_TABS[number];
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('Import');

  return (
    <div style={{ position: 'relative' }}>
      <MainTabsBar tabs={MAIN_TABS} activeTab={activeMainTab} onTabChange={setActiveMainTab} />

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
      {activeMainTab === 'E-Invoice Reco' && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>E-Invoice Reco coming soon</div>
      )}
      {activeMainTab === 'E-way Bill Reco' && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>E-way Bill Reco coming soon</div>
      )}
    </div>
  );
}
