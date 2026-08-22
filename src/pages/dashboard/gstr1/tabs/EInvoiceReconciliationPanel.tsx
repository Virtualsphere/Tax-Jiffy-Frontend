import { useState, useMemo } from 'react';
import { UnifiedTable } from '@/components/UnifiedTable';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import {
  useEInvoiceRecoSync,
  useEInvoicesQuery,
  useReconciliationResultQuery,
  useUnlinkedQuery,
} from '../hooks/useEInvoiceReco';
import type { EInvoiceOnlyRow } from '../types/einvoice-reco.types';

import { UnlinkedInvoicesModal } from '../components/UnlinkedInvoicesModal';

export interface EInvoiceReconciliationPanelProps {
  filingId: number;
}

const EINVOICE_ONLY_TAB = 'EINVOICE_ONLY';

const TABS = [
  { label: 'All', value: 'ALL' },
  { label: 'Matched', value: 'MATCHED' },
  { label: 'Mismatch', value: 'MISMATCH' }, // Substring matching to handle backend inconsistencies
  { label: 'Sale Reg Only', value: 'SALE_REGISTER_ONLY' },
  { label: 'E-Invoice Only', value: EINVOICE_ONLY_TAB },
];

/** Same key the backend pairs on: counterparty GSTIN + invoice/document number. */
function pairKey(gstin?: string | null, docNo?: string | null): string {
  return `${(gstin ?? '').toUpperCase()}|${(docNo ?? '').trim().toUpperCase()}`;
}

export function EInvoiceReconciliationPanel({ filingId }: EInvoiceReconciliationPanelProps) {
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Fetch all data once (without matchStatus param)
  const { data: allRecoData = [], isLoading, isFetching } = useReconciliationResultQuery(filingId, 'ALL');
  const { data: unlinkedData = [] } = useUnlinkedQuery(filingId);
  const {
    data: einvoiceRows = [],
    isLoading: isLoadingEinvoices,
    isFetching: isFetchingEinvoices,
  } = useEInvoicesQuery(filingId);

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
      cellRenderer: (params: ICellRendererParams) => {
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

  // On this tab the sale-register side is null by definition, so show the e-invoice
  // detail the portal returned instead of two columns of dashes.
  const einvoiceOnlyColumnDefs: ColDef[] = [
    { field: 'invoiceNumber', headerName: 'Doc No.', width: 140, pinned: 'left' },
    { field: 'recipientGstin', headerName: 'Recipient GSTIN', width: 160 },
    { field: 'docDate', headerName: 'Doc Date', width: 120, valueFormatter: (p) => p.value || '—' },
    { field: 'docType', headerName: 'Doc Type', width: 110, valueFormatter: (p) => p.value || '—' },
    { field: 'supplyType', headerName: 'Supply Type', width: 130, valueFormatter: (p) => p.value || '—' },
    {
      field: 'einvoiceInvoiceValue',
      headerName: 'E-Invoice Value',
      width: 150,
      valueFormatter: (params) => params.value != null ? `₹${params.value.toFixed(2)}` : '—'
    },
    {
      field: 'einvoiceStatus',
      headerName: 'IRN Status',
      width: 130,
      cellRenderer: (params: ICellRendererParams) => {
        const val = params.value;
        if (!val) return '—';
        const isCancelled = String(val).toUpperCase() === 'CNL';
        const color = isCancelled ? '#ef4444' : '#10b981';
        return (
          <span style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '9999px',
            backgroundColor: `${color}15`,
            color,
            fontSize: '0.75rem',
            fontWeight: 600
          }}>
            {isCancelled ? 'Cancelled' : 'Active'}
          </span>
        );
      }
    },
    { field: 'ewbNo', headerName: 'E-Way Bill No.', width: 150, valueFormatter: (p) => p.value ?? '—' },
    { field: 'einvoiceIrn', headerName: 'IRN', width: 250, valueFormatter: (params) => params.value || '—' },
  ];

  /**
   * Every e-invoice on the portal that the uploaded sale register doesn't account for.
   *
   * Two sources, because neither is complete on its own:
   *  - `/result` rows the backend already flagged IN_EINVOICE_ONLY
   *  - unpaired rows from `/einvoices`, which is where SEZ/export supplies and credit &
   *    debit notes live — reconciliation only runs over B2B + INV rows, so those
   *    documents never reach `/result` at all and the tab looked empty.
   */
  const einvoiceOnlyData = useMemo<EInvoiceOnlyRow[]>(() => {
    const einvoiceByKey = new Map(
      einvoiceRows.map((ei) => [pairKey(ei.supplierGstin, ei.docNum), ei]),
    );

    const rowsByKey = new Map<string, EInvoiceOnlyRow>();

    for (const ei of einvoiceRows) {
      if (ei.isPaired) continue;
      rowsByKey.set(pairKey(ei.supplierGstin, ei.docNum), {
        rowKey: `einvoice-${ei.id}`,
        invoiceNumber: ei.docNum,
        recipientGstin: ei.supplierGstin,
        matchStatus: 'IN_EINVOICE_ONLY',
        einvoiceInvoiceValue: ei.totInvAmt ?? null,
        einvoiceIrn: ei.irn ?? null,
        einvoiceStatus: ei.irnStatus ?? null,
        docDate: ei.docDate ?? null,
        docType: ei.docType ?? null,
        supplyType: ei.supplyType ?? null,
        ewbNo: ei.ewbNo ?? null,
      });
    }

    for (const row of allRecoData) {
      const status = row.matchStatus?.toUpperCase().trim() ?? '';
      if (!status.includes('EINVOICE_ONLY') && !status.includes('E_INVOICE_ONLY')) continue;

      const key = pairKey(row.recipientGstin, row.invoiceNumber);
      const detail = einvoiceByKey.get(key);
      rowsByKey.set(key, {
        rowKey: `result-${row.id}`,
        invoiceNumber: row.invoiceNumber,
        recipientGstin: row.recipientGstin,
        matchStatus: row.matchStatus,
        einvoiceInvoiceValue: row.einvoiceInvoiceValue ?? detail?.totInvAmt ?? null,
        einvoiceIrn: row.einvoiceIrn ?? detail?.irn ?? null,
        einvoiceStatus: row.einvoiceStatus ?? detail?.irnStatus ?? null,
        docDate: detail?.docDate ?? null,
        docType: detail?.docType ?? null,
        supplyType: detail?.supplyType ?? null,
        ewbNo: detail?.ewbNo ?? null,
      });
    }

    return [...rowsByKey.values()];
  }, [einvoiceRows, allRecoData]);

  const matchesTab = (matchStatus: string | null | undefined, tab: string): boolean => {
    if (tab === 'ALL') return true;
    if (!matchStatus) return false;
    const status = matchStatus.toUpperCase().trim();

    if (tab === 'MATCHED') {
      return status === 'MATCHED';
    }
    if (tab === 'SALE_REGISTER_ONLY') {
      return status.includes('SALE_REGISTER') || status === 'UNMATCHED';
    }
    if (tab === EINVOICE_ONLY_TAB) {
      return status.includes('EINVOICE_ONLY') || status.includes('E_INVOICE_ONLY');
    }
    if (tab === 'MISMATCH') {
      // Return true if it's not Matched and not one of the one-sided statuses
      // This catches 'VALUE_MISMATCH', 'MISMATCH', 'DIFF', etc.
      const isMatched = status === 'MATCHED';
      const isOneSided = status.includes('SALE_REGISTER') || status.includes('EINVOICE_ONLY') || status.includes('E_INVOICE_ONLY') || status === 'UNMATCHED';
      return !isMatched && !isOneSided;
    }

    return status.includes(tab);
  };

  const isEinvoiceOnlyTab = activeTab === EINVOICE_ONLY_TAB;

  const filteredData = useMemo(() => {
    if (isEinvoiceOnlyTab) return einvoiceOnlyData;
    if (activeTab === 'ALL') return allRecoData;

    return allRecoData.filter((row) => matchesTab(row.matchStatus, activeTab));
  }, [allRecoData, einvoiceOnlyData, activeTab, isEinvoiceOnlyTab]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tab of TABS) {
      counts[tab.value] = tab.value === EINVOICE_ONLY_TAB
        ? einvoiceOnlyData.length
        : allRecoData.filter((row) => matchesTab(row.matchStatus, tab.value)).length;
    }
    return counts;
  }, [allRecoData, einvoiceOnlyData]);

  const tabIsLoading = isEinvoiceOnlyTab ? isLoading || isLoadingEinvoices : isLoading;
  const tabIsFetching = isEinvoiceOnlyTab ? isFetching || isFetchingEinvoices : isFetching;

  // "Nothing synced yet" is a different problem from "synced, everything matched",
  // and the table's generic "No Records" can't tell the user which one this is.
  const showNothingSyncedHint = isEinvoiceOnlyTab
    && !tabIsLoading
    && einvoiceOnlyData.length === 0
    && einvoiceRows.length === 0;

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
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {tab.label}
              {tabCounts[tab.value] > 0 && (
                <span style={{
                  backgroundColor: activeTab === tab.value ? '#eef0fb' : '#f1f5f9',
                  color: activeTab === tab.value ? '#5a6acf' : '#64748b',
                  padding: '1px 7px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  {tabCounts[tab.value]}
                </span>
              )}
            </button>
          ))}
        </div>

        {showNothingSyncedHint && (
          <div style={{
            margin: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            fontSize: '0.875rem',
            color: '#1e40af'
          }}>
            No e-invoices have been fetched for this period yet — click <strong>Sync E-Invoices</strong> to pull them from the GST Portal.
          </div>
        )}

        {/* Table */}
        <div style={{ height: '500px' }}>
          {tabIsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>
              Loading reconciliation data...
            </div>
          ) : (
            <div style={{ height: '100%', opacity: tabIsFetching ? 0.6 : 1, transition: 'opacity 0.2s' }}>
              <UnifiedTable
                rowData={filteredData}
                columnDefs={isEinvoiceOnlyTab ? einvoiceOnlyColumnDefs : columnDefs}
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
