import { useCallback, useState } from 'react';
import { SimpleUploadUI } from '@/components/SimpleUploadUI/SimpleUploadUI';

export function IMSPage() {
  const handleUpload = useCallback((file: File, year: string, month: string) => {
    // API logic to be provided by user later
    console.log('Uploading IMS file:', file.name, year, month);
  }, []);

  const handleSync = useCallback(() => {
    // API logic to be provided by user later
    console.log('Syncing IMS');
  }, []);

  const MAIN_TABS = ['Import', 'Inward - IMS Reco'] as const;
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
          title="IMS"
          subtitle="Upload your IMS data"
          onUpload={handleUpload}
          onSync={handleSync}
        />
      )}
      {activeMainTab === 'Inward - IMS Reco' && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Inward - IMS Reco coming soon</div>
      )}
    </div>
  );
}
