import { useState, useMemo } from 'react';
import { UnifiedTable } from '@/components/UnifiedTable';
import type { ColDef } from 'ag-grid-community';
import {
  useEwaybillRecoSync,
  useEwaybillReconciliationResultQuery,
  useEwaybillUnlinkedQuery,
} from '../hooks/useEwaybillReco';
import { UnlinkedEwaybillModal } from '../components/UnlinkedEwaybillModal';

export interface EwaybillReconciliationPanelProps {
  filingId: number;
}

function formatAmount(v: number | null): string {
  if (v == null) return '—';
  return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function EwaybillReconciliationPanel({ filingId }: EwaybillReconciliationPanelProps) {
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastRunTime, setLastRunTime] = useState<Date | null>(null);

  const { data: allRecoData = [], isLoading, isFetching } = useEwaybillReconciliationResultQuery(filingId, 'ALL');
  const { data: unlinkedData = [] } = useEwaybillUnlinkedQuery(filingId);

  const reconcileMutation = useEwaybillRecoSync();

  const handleReconcile = async () => {
    try {
      await reconcileMutation.mutateAsync(filingId);
      setLastRunTime(new Date());
    } catch (error) {
      console.error('Failed to reconcile e-way bills:', error);
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return '#64748b';
    const s = status.toUpperCase();
    if (s.includes('MATCHED')) return '#10b981'; // Green
    if (s.includes('MISMATCH')) return '#f59e0b'; // Amber
    if (s.includes('SALE_REGISTER_ONLY')) return '#3b82f6'; // Blue
    if (s.includes('EWAYBILL_ONLY')) return '#ef4444'; // Red
    return '#64748b';
  };

  const columnDefs: ColDef[] = [
    { field: 'ewbNo', headerName: 'E-Way Bill No.', width: 150, pinned: 'left', valueFormatter: (p) => p.value ?? '—' },
    { field: 'docNo', headerName: 'Doc No.', width: 130, valueFormatter: (p) => p.value || '—' },
    { field: 'recipientGstin', headerName: 'Recipient GSTIN', width: 160, valueFormatter: (p) => p.value || '—' },
    {
      field: 'invoiceNumbers',
      headerName: 'Invoices in Bucket',
      width: 220,
      valueFormatter: (p) => p.value || '—',
    },
    {
      field: 'matchStatus',
      headerName: 'Status',
      width: 190,
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
      field: 'ewaybillValue',
      headerName: 'E-Way Bill Value',
      width: 150,
      valueFormatter: (params) => formatAmount(params.value),
    },
    {
      field: 'saleRegisterValue',
      headerName: 'Sale Reg. Value',
      width: 150,
      valueFormatter: (params) => formatAmount(params.value),
    },
    {
      field: 'difference',
      headerName: 'Bucket Remaining',
      width: 170,
      cellRenderer: (params: any) => {
        const v = params.value;
        if (v == null) return '—';
        const isEmpty = Math.abs(v) < 0.01;
        return (
          <span style={{ color: isEmpty ? '#10b981' : '#dc2626', fontWeight: 600 }}>
            {isEmpty ? '✓ Empty' : formatAmount(v)}
          </span>
        );
      },
    },
  ];

  const TABS = [
    { label: 'All', value: 'ALL' },
    { label: 'Matched', value: 'MATCHED' },
    { label: 'Mismatch', value: 'MISMATCH' },
    { label: 'Sale Reg Only', value: 'SALE_REGISTER_ONLY' },
    { label: 'E-Way Bill Only', value: 'EWAYBILL_ONLY' },
  ];

  const filteredData = useMemo(() => {
    if (activeTab === 'ALL') return allRecoData;

    return allRecoData.filter((row) => {
      if (!row.matchStatus) return false;
      const status = row.matchStatus.toUpperCase().trim();

      if (activeTab === 'MATCHED') return status === 'MATCHED';
      if (activeTab === 'SALE_REGISTER_ONLY') return status.includes('SALE_REGISTER');
      if (activeTab === 'EWAYBILL_ONLY') return status.includes('EWAYBILL_ONLY');
      if (activeTab === 'MISMATCH') {
        const isMatched = status === 'MATCHED';
        const isOneSided = status.includes('SALE_REGISTER') || status.includes('EWAYBILL_ONLY');
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
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', color: '#1e293b' }}>E-Way Bill Reconciliation</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
            {lastRunTime
              ? `Last reconciled: ${lastRunTime.toLocaleTimeString()}`
              : 'A single e-way bill can cover multiple invoices — click Reconcile to match invoice values against each e-way bill.'}
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
              Need E-Way Bill
            </button>
          )}

          <button
            onClick={handleReconcile}
            disabled={reconcileMutation.isPending}
            style={{
              backgroundColor: '#5a6acf',
              color: '#fff',
              border: 'none',
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: reconcileMutation.isPending ? 'not-allowed' : 'pointer',
              opacity: reconcileMutation.isPending ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {reconcileMutation.isPending ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '1rem', height: '1rem', border: '2px solid #fff', borderRightColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
                Reconciling...
              </>
            ) : (
              'Reconcile E-Way Bills'
            )}
          </button>
        </div>
      </div>

      {/* Main Table Area */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {/* Sub-tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 1rem' }}>
          {TABS.map((tab) => (
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
        <UnlinkedEwaybillModal filingId={filingId} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
