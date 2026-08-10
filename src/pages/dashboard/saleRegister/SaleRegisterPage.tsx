import { useCallback, useState } from 'react';
import { SimpleUploadUI } from '@/components/SimpleUploadUI/SimpleUploadUI';

export function SaleRegisterPage() {
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
