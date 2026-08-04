import { useState, useMemo } from 'react';
import { UnifiedTable } from '@/components/UnifiedTable';
import type { ColDef } from 'ag-grid-community';
import { useEInvoiceRecoSync, useReconciliationResultQuery, useUnlinkedQuery } from '../hooks/useEInvoiceReco';

import { UnlinkedInvoicesModal } from '../components/UnlinkedInvoicesModal';

export interface GSTR1ReconciliationTabProps {
  filingId: number;
}

export function GSTR1ReconciliationTab({ filingId }: GSTR1ReconciliationTabProps) {
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Fetch all data once (without matchStatus param)
  const { data: allRecoData = [], isLoading, isFetching } = useReconciliationResultQuery(filingId, 'ALL');
  const { data: unlinkedData = [] } = useUnlinkedQuery(filingId);
  
  const syncMutation = useEInvoiceRecoSync();

  const handleSync = async () => {
    try {
      await syncMutation.mutateAsync(filingId);
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Failed to sync e-invoices:', error);
      // Let the mutation handle errors globally or add a toast here
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return '#64748b';
    const s = status.toUpperCase();
    if (s.includes('MATCHED')) return '#10b981'; // Green
    if (s.includes('MISMATCH')) return '#f59e0b'; // Amber
    if (s.includes('SALE_REGISTER_ONLY')) return '#3b82f6'; // Blue
    if (s.includes('EINVOICE_ONLY')) return '#ef4444'; // Red
    return '#64748b';
  };

  const columnDefs: ColDef[] = [
    { field: 'invoiceNumber', headerName: 'Invoice No.', width: 140, pinned: 'left' },
    { field: 'recipientGstin', headerName: 'Recipient GSTIN', width: 160 },
    {
      field: 'matchStatus',
      headerName: 'Status',
      width: 200,
      cellRenderer: (params: any) => {
        const val = params.value;
        const color = getStatusColor(val);
        const label = val?.replace(/_/g, ' ');
        return (
          <span style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '9999px',
            backgroundColor: `${color}15`,
            color: color,
            fontSize: '0.75rem',
            fontWeight: 600
          }}>
            {label}
          </span>
        );
      }
    },
    {
      field: 'saleRegisterInvoiceValue',
      headerName: 'Sale Reg. Value',
      width: 140,
      valueFormatter: (params) => params.value != null ? `₹${params.value.toFixed(2)}` : '—'
    },
    {
      field: 'einvoiceInvoiceValue',
      headerName: 'E-Invoice Value',
      width: 140,
      valueFormatter: (params) => params.value != null ? `₹${params.value.toFixed(2)}` : '—'
    },
    { field: 'einvoiceIrn', headerName: 'IRN', width: 250, valueFormatter: (params) => params.value || '—' },
  ];

  const TABS = [
    { label: 'All', value: 'ALL' },
    { label: 'Matched', value: 'MATCHED' },
    { label: 'Mismatch', value: 'MISMATCH' }, // Substring matching to handle backend inconsistencies
    { label: 'Sale Reg Only', value: 'SALE_REGISTER_ONLY' },
    { label: 'E-Invoice Only', value: 'EINVOICE_ONLY' }
  ];

  const filteredData = useMemo(() => {
    if (activeTab === 'ALL') return allRecoData;
    
    return allRecoData.filter(row => {
      if (!row.matchStatus) return false;
      const status = row.matchStatus.toUpperCase().trim();
      
      if (activeTab === 'MATCHED') {
        return status === 'MATCHED';
      }
      if (activeTab === 'SALE_REGISTER_ONLY') {
        return status.includes('SALE_REGISTER') || status === 'UNMATCHED';
      }
      if (activeTab === 'EINVOICE_ONLY') {
        return status.includes('EINVOICE_ONLY') || status.includes('E_INVOICE_ONLY');
      }
      if (activeTab === 'MISMATCH') {
        // Return true if it's not Matched and not one of the one-sided statuses
        // This catches 'VALUE_MISMATCH', 'MISMATCH', 'DIFF', etc.
        const isMatched = status === 'MATCHED';
        const isOneSided = status.includes('SALE_REGISTER') || status.includes('EINVOICE_ONLY') || status.includes('E_INVOICE_ONLY') || status === 'UNMATCHED';
        return !isMatched && !isOneSided;
      }
      
      return status.includes(activeTab);
    });
  }, [allRecoData, activeTab]);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', color: '#1e293b' }}>E-Invoice Reconciliation</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
            {lastSyncTime ? `Last synced: ${lastSyncTime.toLocaleTimeString()}` : 'Click sync to fetch latest e-invoices from GST Portal'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {unlinkedData.length > 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                backgroundColor: '#fff',
                border: '1px solid #3b82f6',
                color: '#3b82f6',
                padding: '0.625rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
                {unlinkedData.length}
              </span>
              Need E-Invoicing
            </button>
          )}
          
          <button
            onClick={handleSync}
            disabled={syncMutation.isPending}
            style={{
              backgroundColor: '#5a6acf',
              color: '#fff',
              border: 'none',
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: syncMutation.isPending ? 'not-allowed' : 'pointer',
              opacity: syncMutation.isPending ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {syncMutation.isPending ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '1rem', height: '1rem', border: '2px solid #fff', borderRightColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
                Syncing...
              </>
            ) : (
              'Sync E-Invoices'
            )}
          </button>
        </div>
      </div>

      {/* Main Table Area */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        
        {/* Sub-tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 1rem' }}>
          {TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              style={{
                padding: '1rem 1.25rem',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.value ? '2px solid #5a6acf' : '2px solid transparent',
                color: activeTab === tab.value ? '#5a6acf' : '#64748b',
                fontWeight: activeTab === tab.value ? 600 : 500,
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ height: '500px' }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>
              Loading reconciliation data...
            </div>
          ) : (
            <div style={{ height: '100%', opacity: isFetching ? 0.6 : 1, transition: 'opacity 0.2s' }}>
              <UnifiedTable
                rowData={filteredData}
                columnDefs={columnDefs}
                hideHeader
                variant="nested"
                showFilterBarInFullscreenOnly={true}
              />
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <UnlinkedInvoicesModal
          filingId={filingId}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
