import { useState, useMemo } from 'react';
import { UnifiedTable } from '@/components/UnifiedTable';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { usePeriod } from '@/context/PeriodContext';
import { useCurrentEntity } from '@/hooks/useCurrentEntity';
import { toSyncDate } from '@/lib/period';
import {
  useEwaybillRecoSync,
  useEwaybillReconciliationResultQuery,
  useEwaybillUnlinkedQuery,
  useEwaybillPeriodRecordsQuery,
} from '../hooks/useEwaybillReco';
import type { EwaybillOnlyRow } from '../types/ewaybill-reco.types';
import type { EWayBillRecord } from '@/pages/dashboard/eWayBill/types/ewaybill.types';
import { UnlinkedEwaybillModal } from '../components/UnlinkedEwaybillModal';

export interface EwaybillReconciliationPanelProps {
  filingId: number;
}

const EWAYBILL_ONLY_TAB = 'EWAYBILL_ONLY';

const TABS = [
  { label: 'All', value: 'ALL' },
  { label: 'Matched', value: 'MATCHED' },
  { label: 'Mismatch', value: 'MISMATCH' },
  { label: 'Sale Reg Only', value: 'SALE_REGISTER_ONLY' },
  { label: 'E-Way Bill Only', value: EWAYBILL_ONLY_TAB },
];

const EXCLUSION_LABELS: Record<string, string> = {
  OUT_OF_PERIOD: 'Dated outside this period',
  NO_DATE: 'No readable date',
  NOT_RECONCILED: 'Not reconciled yet',
};

const EXCLUSION_TOOLTIPS: Record<string, string> = {
  OUT_OF_PERIOD:
    'Reconciliation matches e-way bills to a GSTR-1 period by their document date, not by the period they were imported under. This bill’s date falls in another month, so Reconcile skips it.',
  NO_DATE:
    'Neither the document date nor the e-way bill date is in a format reconciliation can read (dd-MM-yyyy, dd/MM/yyyy or yyyy-MM-dd), so it cannot be placed in any period.',
  NOT_RECONCILED:
    'This bill is dated inside the selected period but is missing from the reconciliation result — run Reconcile E-Way Bills.',
};

function formatAmount(v: number | null): string {
  if (v == null) return '—';
  return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Mirrors the backend's own date parser (`Gstr1EwaybillReconciliationService#parseDate`): first
 * whitespace-delimited token, in dd-MM-yyyy, dd/MM/yyyy or yyyy-MM-dd. Anything else is a date the
 * backend cannot place in a month either, which is exactly what this needs to detect.
 */
function parseEwbDate(value: string | null): { year: number; month: number } | null {
  if (!value) return null;
  const datePart = value.trim().split(/\s+/)[0];

  const dmy = /^(\d{2})[-/](\d{2})[-/](\d{4})$/.exec(datePart);
  if (dmy) return { year: Number(dmy[3]), month: Number(dmy[2]) };

  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (ymd) return { year: Number(ymd[1]), month: Number(ymd[2]) };

  return null;
}

/** The date the backend's period filter would judge this record by — docDate, else ewbDate. */
function effectiveEwbDate(record: EWayBillRecord): string | null {
  return parseEwbDate(record.docDate) ? record.docDate : record.ewbDate;
}

/**
 * Why Reconcile left an imported e-way bill out of the result. The backend filters e-way bills to
 * the filing's period by the record's own parsed date and ignores which sync-date filing it was
 * imported under, so a bill can sit in the period's E-Way Bill page and still never reach the
 * reconciliation result — and re-running Reconcile will keep skipping it.
 */
function exclusionReason(
  record: EWayBillRecord,
  periodYear: number,
  periodMonth: number,
): 'OUT_OF_PERIOD' | 'NO_DATE' | 'NOT_RECONCILED' {
  const parsed = parseEwbDate(record.docDate) ?? parseEwbDate(record.ewbDate);
  if (!parsed) return 'NO_DATE';
  if (parsed.year !== periodYear || parsed.month !== periodMonth) return 'OUT_OF_PERIOD';
  return 'NOT_RECONCILED';
}

function matchesTab(matchStatus: string | null | undefined, tab: string): boolean {
  if (tab === 'ALL') return true;
  if (!matchStatus) return false;
  const status = matchStatus.toUpperCase().trim();

  if (tab === 'MATCHED') return status === 'MATCHED';
  if (tab === 'SALE_REGISTER_ONLY') return status.includes('SALE_REGISTER');
  if (tab === EWAYBILL_ONLY_TAB) return status.includes('EWAYBILL_ONLY') || status.includes('EWAY_BILL_ONLY');
  if (tab === 'MISMATCH') {
    const isMatched = status === 'MATCHED';
    const isOneSided =
      status.includes('SALE_REGISTER') || status.includes('EWAYBILL_ONLY') || status.includes('EWAY_BILL_ONLY');
    return !isMatched && !isOneSided;
  }

  return status.includes(tab);
}

export function EwaybillReconciliationPanel({ filingId }: EwaybillReconciliationPanelProps) {
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastRunTime, setLastRunTime] = useState<Date | null>(null);

  const { selectedYear, selectedMonth, periodLabel } = usePeriod();
  const { data: currentEntity } = useCurrentEntity();
  const syncDate = useMemo(
    () => toSyncDate(selectedYear.label, selectedMonth),
    [selectedYear, selectedMonth],
  );
  /** syncDate is already "YYYY-MM-01", so it carries the period the backend filters e-way bills to. */
  const [periodYear, periodMonth] = useMemo(() => {
    const [y, m] = syncDate.split('-');
    return [Number(y), Number(m)];
  }, [syncDate]);

  const { data: allRecoData = [], isLoading, isFetching } = useEwaybillReconciliationResultQuery(filingId, 'ALL');
  const { data: unlinkedData = [] } = useEwaybillUnlinkedQuery(filingId);
  const {
    data: periodEwbRecords = [],
    isLoading: isLoadingRecords,
    isFetching: isFetchingRecords,
  } = useEwaybillPeriodRecordsQuery(currentEntity?.id || undefined, syncDate);

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
      cellRenderer: (params: ICellRendererParams) => {
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

  // On this tab the sale-register side is empty by definition, so show the e-way bill's own
  // detail instead of two columns of dashes.
  const ewaybillOnlyColumnDefs: ColDef[] = [
    { field: 'ewbNo', headerName: 'E-Way Bill No.', width: 150, pinned: 'left', valueFormatter: (p) => p.value ?? '—' },
    { field: 'docNo', headerName: 'Doc No.', width: 150, valueFormatter: (p) => p.value || '—' },
    { field: 'docDate', headerName: 'Doc Date', width: 120, valueFormatter: (p) => p.value || '—' },
    { field: 'ewbDate', headerName: 'EWB Date', width: 120, valueFormatter: (p) => p.value || '—' },
    {
      field: 'recipientGstin',
      headerName: 'Recipient GSTIN',
      width: 170,
      tooltipValueGetter: (p) => p.data?.recipientName ?? undefined,
      valueFormatter: (p) => p.value || '—',
    },
    {
      field: 'ewaybillValue',
      headerName: 'E-Way Bill Value',
      width: 160,
      valueFormatter: (params) => formatAmount(params.value),
    },
    {
      field: 'status',
      headerName: 'EWB Status',
      width: 130,
      cellRenderer: (params: ICellRendererParams) => {
        const val = params.value;
        if (!val) return '—';
        const s = String(val).toUpperCase();
        const isCancelled = s === 'CNL' || s === 'CANCELLED';
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
            {isCancelled ? 'Cancelled' : val}
          </span>
        );
      },
    },
    {
      field: 'exclusionReason',
      headerName: 'Why It Is Here',
      width: 210,
      tooltipValueGetter: (p) => EXCLUSION_TOOLTIPS[p.value as string] ?? undefined,
      cellRenderer: (params: ICellRendererParams) => {
        const label = EXCLUSION_LABELS[params.value as string];
        if (!label) return <span style={{ color: '#64748b', fontSize: '0.75rem' }}>No invoice found</span>;
        return <span style={{ color: '#b45309', fontWeight: 600, fontSize: '0.75rem' }}>{label}</span>;
      },
    },
    { field: 'validUpto', headerName: 'Valid Upto', width: 130, valueFormatter: (p) => p.value || '—' },
    { field: 'source', headerName: 'Source', width: 110, valueFormatter: (p) => p.value || '—' },
  ];

  /** The e-way bill numbers the last reconciliation run actually looked at. */
  const reconciledEwbNos = useMemo(
    () => new Set(allRecoData.filter((r) => r.ewbNo != null).map((r) => Number(r.ewbNo))),
    [allRecoData],
  );

  /**
   * Every e-way bill for this period that no sale-register invoice accounts for.
   *
   * Two sources, because neither is complete on its own:
   *  - `/result` rows the backend already flagged IN_EWAYBILL_ONLY
   *  - e-way bills from the period's own filing that the last Reconcile never covered —
   *    bills imported since that run, or ones the backend's period filter skipped. Those
   *    never reach `/result` at all, which is why this tab came up empty.
   */
  const ewaybillOnlyData = useMemo<EwaybillOnlyRow[]>(() => {
    const recordByEwbNo = new Map(
      periodEwbRecords.filter((r) => r.ewbNo != null).map((r) => [Number(r.ewbNo), r]),
    );

    const rowsByKey = new Map<string, EwaybillOnlyRow>();

    for (const rec of periodEwbRecords) {
      if (rec.ewbNo != null && reconciledEwbNos.has(Number(rec.ewbNo))) continue;
      rowsByKey.set(rec.ewbNo != null ? `ewb-${rec.ewbNo}` : `rec-${rec.id}`, {
        rowKey: `record-${rec.id}`,
        ewbNo: rec.ewbNo,
        docNo: rec.docNo,
        docDate: rec.docDate,
        ewbDate: rec.ewbDate,
        recipientGstin: rec.toGstin,
        recipientName: rec.toTrdName,
        ewaybillValue: rec.totalValue ?? rec.totInvValue ?? null,
        status: rec.status,
        validUpto: rec.validUpto,
        source: rec.source,
        exclusionReason: exclusionReason(rec, periodYear, periodMonth),
      });
    }

    for (const row of allRecoData) {
      if (!matchesTab(row.matchStatus, EWAYBILL_ONLY_TAB)) continue;

      const detail = row.ewbNo != null ? recordByEwbNo.get(Number(row.ewbNo)) : undefined;
      rowsByKey.set(row.ewbNo != null ? `ewb-${row.ewbNo}` : `result-${row.id}`, {
        rowKey: `result-${row.id}`,
        ewbNo: row.ewbNo,
        docNo: row.docNo ?? detail?.docNo ?? null,
        docDate: detail?.docDate ?? null,
        ewbDate: detail?.ewbDate ?? null,
        recipientGstin: row.recipientGstin ?? detail?.toGstin ?? null,
        recipientName: detail?.toTrdName ?? null,
        ewaybillValue: row.ewaybillValue ?? detail?.totalValue ?? null,
        status: detail?.status ?? null,
        validUpto: detail?.validUpto ?? null,
        source: detail?.source ?? null,
        exclusionReason: null,
      });
    }

    return [...rowsByKey.values()];
  }, [periodEwbRecords, allRecoData, reconciledEwbNos, periodYear, periodMonth]);

  const isEwaybillOnlyTab = activeTab === EWAYBILL_ONLY_TAB;

  const filteredData = useMemo(() => {
    if (isEwaybillOnlyTab) return ewaybillOnlyData;
    if (activeTab === 'ALL') return allRecoData;

    return allRecoData.filter((row) => matchesTab(row.matchStatus, activeTab));
  }, [allRecoData, ewaybillOnlyData, activeTab, isEwaybillOnlyTab]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tab of TABS) {
      counts[tab.value] = tab.value === EWAYBILL_ONLY_TAB
        ? ewaybillOnlyData.length
        : allRecoData.filter((row) => matchesTab(row.matchStatus, tab.value)).length;
    }
    return counts;
  }, [allRecoData, ewaybillOnlyData]);

  const tabIsLoading = isEwaybillOnlyTab ? isLoading || isLoadingRecords : isLoading;
  const tabIsFetching = isEwaybillOnlyTab ? isFetching || isFetchingRecords : isFetching;

  /**
   * Imported e-way bills the reconciliation result has no row for, split by why. Re-running
   * Reconcile only helps the NOT_RECONCILED group — for the other two the backend's period filter
   * will skip the bill again, so telling the user to click the button would just be a loop.
   */
  const excluded = useMemo(() => {
    const missing = periodEwbRecords.filter(
      (r) => r.ewbNo == null || !reconciledEwbNos.has(Number(r.ewbNo)),
    );
    const by = (reason: string) => missing.filter((r) => exclusionReason(r, periodYear, periodMonth) === reason);
    return {
      total: missing.length,
      outOfPeriod: by('OUT_OF_PERIOD'),
      noDate: by('NO_DATE'),
      notReconciled: by('NOT_RECONCILED'),
    };
  }, [periodEwbRecords, reconciledEwbNos, periodYear, periodMonth]);

  // "Nothing imported yet" is a different problem from "imported, nothing matched", and the
  // table's generic "No Records" can't tell the user which one this is.
  const showNothingImportedHint = !isLoadingRecords && periodEwbRecords.length === 0;
  const showExcludedHint = !showNothingImportedHint && excluded.total > 0 && !reconcileMutation.isPending;
  /** Clicking Reconcile can only change the outcome for bills the period filter would actually keep. */
  const reconcileCanHelp = excluded.notReconciled.length > 0;
  const sampleSkipped = excluded.outOfPeriod[0] ?? excluded.noDate[0];

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

      {showNothingImportedHint && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          fontSize: '0.875rem',
          color: '#1e40af'
        }}>
          No e-way bills have been imported for <strong>{periodLabel}</strong> yet — sync or upload them on the{' '}
          <strong>E-Way Bill</strong> page, then come back and click <strong>Reconcile E-Way Bills</strong>. Until
          then every invoice stays in <strong>Sale Reg Only</strong>.
        </div>
      )}

      {showExcludedHint && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '8px',
          fontSize: '0.875rem',
          color: '#92400e',
          lineHeight: 1.6
        }}>
          {excluded.total} of the {periodEwbRecords.length} e-way bill{periodEwbRecords.length === 1 ? '' : 's'} imported
          for <strong>{periodLabel}</strong> {excluded.total === 1 ? 'is' : 'are'} not in the reconciliation result.
          {reconcileCanHelp && (
            <> {excluded.notReconciled.length} {excluded.notReconciled.length === 1 ? 'is' : 'are'} simply waiting on a
            run — click <strong>Reconcile E-Way Bills</strong>.</>
          )}
          {sampleSkipped && (
            <>
              {' '}Reconciliation matches e-way bills to a period by their <strong>document date</strong>, not by the
              period they were imported under, so{' '}
              {excluded.outOfPeriod.length > 0 && (
                <>{excluded.outOfPeriod.length} dated outside {periodLabel} </>
              )}
              {excluded.outOfPeriod.length > 0 && excluded.noDate.length > 0 && 'and '}
              {excluded.noDate.length > 0 && <>{excluded.noDate.length} with no readable date </>}
              will be skipped again on every run (e.g. e-way bill{' '}
              <strong>{sampleSkipped.ewbNo ?? '—'}</strong> dated{' '}
              <strong>{effectiveEwbDate(sampleSkipped) || 'blank'}</strong>). Fix the dates on the{' '}
              <strong>E-Way Bill</strong> page, or reconcile from the period those bills belong to — see the{' '}
              <strong>E-Way Bill Only</strong> tab for the full list.
            </>
          )}
        </div>
      )}

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
                columnDefs={isEwaybillOnlyTab ? ewaybillOnlyColumnDefs : columnDefs}
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
