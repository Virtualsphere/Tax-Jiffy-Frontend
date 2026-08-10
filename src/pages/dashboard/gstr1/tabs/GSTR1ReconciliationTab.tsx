import { useState } from 'react';
import { EInvoiceReconciliationPanel } from './EInvoiceReconciliationPanel';
import { EwaybillReconciliationPanel } from './EwaybillReconciliationPanel';

export interface GSTR1ReconciliationTabProps {
  filingId: number;
}

const SUB_TABS = ['E-Invoice', 'E-Way Bill'] as const;
type SubTab = typeof SUB_TABS[number];

export function GSTR1ReconciliationTab({ filingId }: GSTR1ReconciliationTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('E-Invoice');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f3f9', borderRadius: 9999, padding: '4px', width: 'fit-content' }}>
        {SUB_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveSubTab(tab)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 9999,
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              backgroundColor: activeSubTab === tab ? '#fff' : 'transparent',
              color: activeSubTab === tab ? '#5a6acf' : '#64748b',
              boxShadow: activeSubTab === tab ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeSubTab === 'E-Invoice' && <EInvoiceReconciliationPanel filingId={filingId} />}
      {activeSubTab === 'E-Way Bill' && <EwaybillReconciliationPanel filingId={filingId} />}
    </div>
  );
}
