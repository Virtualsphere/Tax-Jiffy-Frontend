import { useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { CellValueChangedEvent, ColDef } from 'ag-grid-community';
import {
  useFinalizeGstr2b,
  useGstr2bReconciliationQuery,
  useUpdateGstr2bInvoice,
} from '../hooks/useGstr2bReconciliation';
import type { Gstr2bMatchStatus, Gstr2bReconciliationRow } from '../types/gstr2b-filing.types';

export interface Gstr2bReconciliationPanelProps {
  filingId: number;
  filingStatus: string;
  retPeriod: string;
}

const BUCKET_META: Record<Gstr2bMatchStatus, { label: string; color: string }> = {
  MATCHED: { label: 'Matched', color: '#10b981' },
  ROUNDING_DIFFERENCE: { label: 'Rounding', color: '#94a3b8' },
  TAXABLE_VALUE_DIFFERS: { label: 'Taxable Value Differs', color: '#f59e0b' },
  TAX_AMOUNT_DIFFERS: { label: 'Tax Amount Differs', color: '#d97706' },
  TAX_HEAD_DIFFERS_POS: { label: 'Wrong Tax Head (POS)', color: '#7c2d92' },
  ONLY_IN_2B: { label: 'Not in IMS', color: '#3b82f6' },
  ONLY_IN_IMS: { label: 'Not in GSTR-2B', color: '#ef4444' },
};

const TABS: { label: string; value: Gstr2bMatchStatus | 'ALL' | 'NEEDS_ATTENTION' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Needs Attention', value: 'NEEDS_ATTENTION' },
  { label: 'Matched', value: 'MATCHED' },
  { label: 'Rounding', value: 'ROUNDING_DIFFERENCE' },
  { label: 'Taxable Value Differs', value: 'TAXABLE_VALUE_DIFFERS' },
  { label: 'Tax Amount Differs', value: 'TAX_AMOUNT_DIFFERS' },
  { label: 'Wrong Tax Head (POS)', value: 'TAX_HEAD_DIFFERS_POS' },
  { label: 'Not in IMS', value: 'ONLY_IN_2B' },
  { label: 'Not in GSTR-2B', value: 'ONLY_IN_IMS' },
];

function money(v: number | null | undefined): string {
  if (v == null) return '—';
  return v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function Gstr2bReconciliationPanel({ filingId, filingStatus, retPeriod }: Gstr2bReconciliationPanelProps) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['value']>('NEEDS_ATTENTION');
  const { data: rows = [], isLoading, isFetching } = useGstr2bReconciliationQuery(filingId);
  const updateMutation = useUpdateGstr2bInvoice(filingId);
  const finalizeMutation = useFinalizeGstr2b(filingId);

  const isFinalized = filingStatus === 'FINALIZED';
  const hasImsData = rows.some((r) => r.imsInvoiceId != null);

  const totals = useMemo(() => {
    let atRisk = 0, unclaimed = 0, matched = 0, pending = 0;
    for (const r of rows) {
      atRisk += r.atRisk;
      unclaimed += r.unclaimed;
      if (r.matchStatus === 'MATCHED') matched += 1;
      if (r.reconciliationAction === 'PENDING' && r.matchStatus !== 'MATCHED') pending += 1;
    }
    return { atRisk, unclaimed, matched, pending };
  }, [rows]);

  const filteredData = useMemo(() => {
    if (activeTab === 'ALL') return rows;
    if (activeTab === 'NEEDS_ATTENTION') return rows.filter((r) => r.matchStatus !== 'MATCHED');
    return rows.filter((r) => r.matchStatus === activeTab);
  }, [rows, activeTab]);

  const canEditRow = (row: Gstr2bReconciliationRow) =>
    !isFinalized && row.gstr2bInvoiceId != null;

  const editableGstr2bCol = (field: keyof Gstr2bReconciliationRow, headerName: string): ColDef => ({
    field,
    headerName,
    width: 130,
    type: 'rightAligned',
    editable: (p) => canEditRow(p.data),
    cellClass: (p) => (canEditRow(p.data) ? 'ag-cell-editable' : ''),
    cellEditor: 'agNumberCellEditor',
    cellEditorParams: { precision: 2, min: 0 },
    valueFormatter: (p) => money(p.value),
  });

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'supplierGstin',
      headerName: 'Supplier & GSTIN',
      width: 220,
      pinned: 'left',
      cellRenderer: (p: any) => (
        <div style={{ lineHeight: 1.3 }}>
          <div style={{ fontWeight: 550 }}>{p.data.supplierName || '—'}</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#64748b' }}>{p.value ?? '—'}</div>
        </div>
      ),
    },
    { field: 'invoiceNumber', headerName: 'Invoice No.', width: 150 },
    {
      field: 'matchStatus',
      headerName: 'Difference In',
      width: 190,
      cellRenderer: (p: any) => {
        const meta = BUCKET_META[p.value as Gstr2bMatchStatus];
        return (
          <span style={{
            display: 'inline-block', padding: '2px 8px', borderRadius: '9999px',
            backgroundColor: `${meta.color}15`, color: meta.color, fontSize: '0.75rem', fontWeight: 600,
          }}>
            {meta.label}
          </span>
        );
      },
    },
    editableGstr2bCol('gstr2bTaxableValue', 'GSTR-2B Taxable'),
    editableGstr2bCol('gstr2bIgst', 'GSTR-2B IGST'),
    editableGstr2bCol('gstr2bCgst', 'GSTR-2B CGST'),
    editableGstr2bCol('gstr2bSgst', 'GSTR-2B SGST'),
    editableGstr2bCol('gstr2bCess', 'GSTR-2B Cess'),
    { field: 'imsTaxableValue', headerName: 'IMS Taxable', width: 130, type: 'rightAligned', valueFormatter: (p) => money(p.value) },
    { field: 'imsIgst', headerName: 'IMS IGST', width: 120, type: 'rightAligned', valueFormatter: (p) => money(p.value) },
    { field: 'imsCgst', headerName: 'IMS CGST', width: 120, type: 'rightAligned', valueFormatter: (p) => money(p.value) },
    { field: 'imsSgst', headerName: 'IMS SGST', width: 120, type: 'rightAligned', valueFormatter: (p) => money(p.value) },
    { field: 'imsCess', headerName: 'IMS Cess', width: 120, type: 'rightAligned', valueFormatter: (p) => money(p.value) },
    {
      field: 'atRisk', headerName: 'At Risk', width: 130, type: 'rightAligned',
      cellStyle: { color: '#be123c', fontWeight: 600 },
      valueFormatter: (p) => (p.value ? money(p.value) : '—'),
    },
    {
      field: 'unclaimed', headerName: 'Unclaimed', width: 130, type: 'rightAligned',
      cellStyle: { color: '#0f766e', fontWeight: 600 },
      valueFormatter: (p) => (p.value ? money(p.value) : '—'),
    },
    { field: 'itcAvailability', headerName: 'ITC Eligibility', width: 150 },
    {
      field: 'reconciliationAction',
      headerName: 'Decision',
      width: 130,
      pinned: 'right',
      editable: (p) => !isFinalized && p.data.gstr2bInvoiceId != null,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: ['ACCEPT', 'REJECT', 'PENDING'] },
      cellStyle: (p: any) => {
        if (p.value === 'ACCEPT') return { color: '#0f766e', fontWeight: 600 };
        if (p.value === 'REJECT') return { color: '#be123c', fontWeight: 600 };
        return { color: '#6b7a93', fontWeight: 600 };
      },
    },
  ], [isFinalized]);

  const onCellValueChanged = (e: CellValueChangedEvent<Gstr2bReconciliationRow>) => {
    const row = e.data;
    if (!row.gstr2bInvoiceId) return;
    const field = e.colDef.field as keyof Gstr2bReconciliationRow;
    const fieldMap: Partial<Record<string, string>> = {
      gstr2bTaxableValue: 'taxableValue',
      gstr2bIgst: 'integratedTaxPaid',
      gstr2bCgst: 'centralTaxPaid',
      gstr2bSgst: 'stateUtTaxPaid',
      gstr2bCess: 'cessPaid',
      reconciliationAction: 'reconciliationAction',
    };
    const patchField = fieldMap[field as string];
    if (!patchField) return;
    updateMutation.mutate({ invoiceId: row.gstr2bInvoiceId, patch: { [patchField]: e.newValue } as any });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', color: '#1e293b' }}>GSTR-2B ⇄ IMS Reconciliation — {retPeriod}</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
            {isFinalized
              ? 'This period has been finalized. The corrected GSTR-2B data below is locked.'
              : 'Correct the GSTR-2B side to match IMS, then finalize once every row has a decision.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontFamily: 'monospace', fontSize: '0.875rem' }}>
          <div><span style={{ color: '#64748b' }}>At risk </span><b style={{ color: '#be123c' }}>₹{money(totals.atRisk)}</b></div>
          <div><span style={{ color: '#64748b' }}>Unclaimed </span><b style={{ color: '#0f766e' }}>₹{money(totals.unclaimed)}</b></div>
          <div><span style={{ color: '#64748b' }}>Matched </span><b>{totals.matched}/{rows.length}</b></div>
          <button
            onClick={() => finalizeMutation.mutate()}
            disabled={isFinalized || finalizeMutation.isPending || rows.length === 0}
            style={{
              backgroundColor: isFinalized ? '#94a3b8' : '#5a6acf', color: '#fff', border: 'none',
              padding: '0.625rem 1.25rem', borderRadius: '8px', fontWeight: 600,
              cursor: isFinalized || rows.length === 0 ? 'not-allowed' : 'pointer',
              opacity: finalizeMutation.isPending ? 0.7 : 1,
            }}
          >
            {isFinalized ? 'Finalized' : finalizeMutation.isPending ? 'Finalizing…' : 'Finalize corrected GSTR-2B'}
          </button>
        </div>
      </div>

      {!hasImsData && rows.length > 0 && (
        <div style={{ padding: '0.875rem 1.25rem', borderRadius: '10px', background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: '0.875rem' }}>
          No IMS data found for {retPeriod} yet. Upload IMS for the same period on the IMS page to complete this reconciliation — until then every invoice below shows as "Not in IMS".
        </div>
      )}

      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 1rem', overflowX: 'auto' }}>
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              style={{
                padding: '1rem 1.1rem', backgroundColor: 'transparent', border: 'none', whiteSpace: 'nowrap',
                borderBottom: activeTab === tab.value ? '2px solid #5a6acf' : '2px solid transparent',
                color: activeTab === tab.value ? '#5a6acf' : '#64748b',
                fontWeight: activeTab === tab.value ? 600 : 500, cursor: 'pointer', fontSize: '0.875rem',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ height: '560px' }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>
              Loading reconciliation data...
            </div>
          ) : (
            <div className="ag-theme-tax-jiffy" style={{ height: '100%', width: '100%', opacity: isFetching ? 0.6 : 1, transition: 'opacity 0.2s' }}>
              <AgGridReact
                theme="legacy"
                rowData={filteredData}
                columnDefs={columnDefs}
                getRowId={(p) => p.data.id}
                onCellValueChanged={onCellValueChanged}
                stopEditingWhenCellsLoseFocus
                pagination
                paginationPageSize={25}
                paginationPageSizeSelector={[10, 25, 50, 100]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
