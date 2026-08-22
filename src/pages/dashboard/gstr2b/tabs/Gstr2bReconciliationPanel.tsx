import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type {
  CellValueChangedEvent,
  GetRowIdParams,
  GridApi,
  GridReadyEvent,
  IRowNode,
  RowClassParams,
  RowClickedEvent,
  RowSelectionOptions,
} from 'ag-grid-community';

import { describeApiError } from '@/lib/api-error';
import {
  useBulkUpdateGstr2bInvoices,
  useFinalizeGstr2b,
  useGstr2bReconciliationQuery,
  useUpdateGstr2bInvoice,
  type Gstr2bInvoicePatch,
} from '../hooks/useGstr2bReconciliation';
import type {
  Gstr2bInvoiceUpdateRequest,
  Gstr2bMatchStatus,
  Gstr2bReconciliationRow,
} from '../types/gstr2b-filing.types';
import { ReconBand, ReconContextBar, type BucketFilter } from './recon/ReconBand';
import { buildVendorRows, summarise } from './recon/reconAggregate';
import { auditColumns, canEditRow, decideColumns, vendorColumns, type Lens } from './recon/reconColumns';
import { BUCKET_BULK, BUCKET_META, moneyRounded } from './recon/reconMeta';
import styles from './recon/Recon.module.css';

export interface Gstr2bReconciliationPanelProps {
  filingId: number;
  filingStatus: string;
  retPeriod: string;
}

const LENSES: { id: Lens; label: string; hint: string }[] = [
  { id: 'decide', label: 'Decide', hint: 'work the queue' },
  { id: 'vendors', label: 'Vendors', hint: 'chase suppliers' },
  { id: 'audit', label: 'Audit', hint: 'full ledger' },
];

/** Row field → the field name the update endpoint expects. */
const FIELD_MAP: Record<string, keyof Gstr2bInvoiceUpdateRequest> = {
  gstr2bTaxableValue: 'taxableValue',
  gstr2bIgst: 'integratedTaxPaid',
  gstr2bCgst: 'centralTaxPaid',
  gstr2bSgst: 'stateUtTaxPaid',
  gstr2bCess: 'cessPaid',
  reconciliationAction: 'reconciliationAction',
  remarks: 'remarks',
};

/** Identifiers, not amounts — summing them in the pinned total row would be nonsense. */
const NO_SUM = new Set(['gstr2bInvoiceId', 'imsInvoiceId']);

const ROW_HEIGHT_COMFORTABLE = 48;
const ROW_HEIGHT_COMPACT = 36;

type RowPatch = Partial<Gstr2bReconciliationRow>;

interface RowChange {
  rowId: string;
  invoiceId: number;
  before: RowPatch;
  after: RowPatch;
}

interface HistoryEntry {
  label: string;
  changes: RowChange[];
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function toPatch(values: RowPatch): Gstr2bInvoiceUpdateRequest {
  const patch: Gstr2bInvoiceUpdateRequest = {};
  for (const [field, value] of Object.entries(values)) {
    const target = FIELD_MAP[field];
    if (target) (patch as Record<string, unknown>)[target] = value;
  }
  return patch;
}

export function Gstr2bReconciliationPanel({ filingId, filingStatus, retPeriod }: Gstr2bReconciliationPanelProps) {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGstr2bReconciliationQuery(filingId);
  const updateMutation = useUpdateGstr2bInvoice(filingId);
  const bulkMutation = useBulkUpdateGstr2bInvoices(filingId);
  const finalizeMutation = useFinalizeGstr2b(filingId);

  const isFinalized = filingStatus === 'FINALIZED';

  /**
   * Edits are held as an overlay on top of the server rows so a correction or a bulk
   * fix repaints the band, the statement and the totals immediately. The overlay is
   * dropped the moment fresh data arrives — the server's re-derived match statuses win.
   */
  const [overlay, setOverlay] = useState<Record<string, RowPatch>>({});
  const [seenData, setSeenData] = useState(data);
  if (data !== seenData) {
    setSeenData(data);
    setOverlay({});
  }

  const rows = useMemo(() => {
    // Rank, do not hide: biggest exposure first, settled rows sink to the bottom.
    const ranked = [...(data ?? [])].sort((a, b) => b.atRisk + b.unclaimed - (a.atRisk + a.unclaimed));
    if (!Object.keys(overlay).length) return ranked;
    return ranked.map((row) => (overlay[row.id] ? { ...row, ...overlay[row.id] } : row));
  }, [data, overlay]);

  const [lens, setLens] = useState<Lens>('decide');
  const [activeBucket, setActiveBucket] = useState<BucketFilter>('ALL');
  const [scopeVendor, setScopeVendor] = useState<string | null>(null);
  const [statementOpen, setStatementOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [search, setSearch] = useState('');
  const [undoStack, setUndoStack] = useState<HistoryEntry[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryEntry[]>([]);
  const [selection, setSelection] = useState<{ count: number; exposure: number }>({ count: 0, exposure: 0 });
  const [viewStats, setViewStats] = useState<{
    shown: number;
    risk: number;
    unclaimed: number;
    decided: number;
    pinned: Record<string, unknown>;
  }>({ shown: 0, risk: 0, unclaimed: 0, decided: 0, pinned: { id: '__total' } });

  const apiRef = useRef<GridApi | null>(null);
  const statsSignature = useRef('');

  const vendorRows = useMemo(() => buildVendorRows(rows), [rows]);
  const scopedRows = useMemo(
    () => (scopeVendor ? rows.filter((row) => row.supplierGstin === scopeVendor) : rows),
    [rows, scopeVendor],
  );
  const summary = useMemo(() => summarise(scopedRows), [scopedRows]);
  const hasImsData = useMemo(() => rows.some((row) => row.imsInvoiceId != null), [rows]);

  const scopeLabel = useMemo(() => {
    if (!scopeVendor) return null;
    const first = scopedRows[0];
    return first?.supplierName || scopeVendor;
  }, [scopeVendor, scopedRows]);

  const columnDefs = useMemo(() => {
    if (lens === 'vendors') return vendorColumns();
    return lens === 'audit' ? auditColumns(isFinalized) : decideColumns(isFinalized);
  }, [lens, isFinalized]);

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      filter: true,
      suppressHeaderMenuButton: true,
      minWidth: 80,
      floatingFilter: lens === 'audit',
    }),
    [lens],
  );

  /* ── external filter: bucket + vendor scope ── */
  const isExternalFilterPresent = useCallback(
    () => activeBucket !== 'ALL' || scopeVendor !== null,
    [activeBucket, scopeVendor],
  );

  const doesExternalFilterPass = useCallback(
    (node: IRowNode) => {
      const row = node.data as (Gstr2bReconciliationRow & { supplierGstin?: string | null }) | undefined;
      if (!row) return true;
      if (scopeVendor && row.supplierGstin !== scopeVendor) return false;
      if (lens === 'vendors') return true;
      if (activeBucket !== 'ALL' && row.matchStatus !== activeBucket) return false;
      return true;
    },
    [activeBucket, scopeVendor, lens],
  );

  useEffect(() => {
    // The grid caches the two callbacks above; it has to be told they changed.
    apiRef.current?.onFilterChanged();
  }, [activeBucket, scopeVendor, lens]);

  useEffect(() => {
    // Column filters are keyed by field, and the lenses do not share every field.
    apiRef.current?.setFilterModel(null);
  }, [lens]);

  /* ── footer + pinned totals, recomputed from whatever survives the filters ── */
  const recomputeView = useCallback(() => {
    const api = apiRef.current;
    if (!api || api.isDestroyed()) return;

    let shown = 0;
    let risk = 0;
    let unclaimed = 0;
    let decided = 0;
    const totals: Record<string, number> = {};

    api.forEachNodeAfterFilter((node) => {
      const row = node.data as Record<string, unknown> | undefined;
      if (!row) return;
      shown += 1;
      risk += typeof row.atRisk === 'number' ? row.atRisk : 0;
      unclaimed += typeof row.unclaimed === 'number' ? row.unclaimed : 0;
      if (typeof row.reconciliationAction === 'string' && row.reconciliationAction !== 'PENDING') decided += 1;
      for (const [key, value] of Object.entries(row)) {
        if (typeof value === 'number' && !NO_SUM.has(key)) totals[key] = (totals[key] ?? 0) + value;
      }
    });

    for (const key of Object.keys(totals)) totals[key] = round2(totals[key]);
    const next = { shown, risk: round2(risk), unclaimed: round2(unclaimed), decided, pinned: { id: '__total', ...totals } };
    const signature = JSON.stringify(next);
    if (signature === statsSignature.current) return;
    statsSignature.current = signature;
    setViewStats(next);
  }, []);

  const onSelectionChanged = useCallback(() => {
    const api = apiRef.current;
    if (!api || api.isDestroyed()) return;
    const selected = api.getSelectedRows() as Gstr2bReconciliationRow[];
    setSelection({
      count: selected.length,
      exposure: selected.reduce((total, row) => total + (row.atRisk ?? 0) + (row.unclaimed ?? 0), 0),
    });
  }, []);

  /* ── writes ── */
  const applyLocal = useCallback((changes: RowChange[], direction: 'after' | 'before') => {
    setOverlay((previous) => {
      const next = { ...previous };
      for (const change of changes) next[change.rowId] = { ...next[change.rowId], ...change[direction] };
      return next;
    });
  }, []);

  const commit = useCallback(
    (label: string, changes: RowChange[]) => {
      if (!changes.length) return;
      applyLocal(changes, 'after');
      setUndoStack((stack) => [...stack, { label, changes }]);
      setRedoStack([]);
      const updates: Gstr2bInvoicePatch[] = changes.map((change) => ({
        invoiceId: change.invoiceId,
        patch: toPatch(change.after),
      }));
      bulkMutation.mutate(updates);
    },
    [applyLocal, bulkMutation],
  );

  const editableNodes = useCallback((): IRowNode<Gstr2bReconciliationRow>[] => {
    const api = apiRef.current;
    if (!api || api.isDestroyed() || lens === 'vendors') return [];
    return (api.getSelectedNodes() as IRowNode<Gstr2bReconciliationRow>[]).filter((node) =>
      canEditRow(node.data, isFinalized),
    );
  }, [isFinalized, lens]);

  const filteredNodes = useCallback((): IRowNode<Gstr2bReconciliationRow>[] => {
    const api = apiRef.current;
    if (!api || api.isDestroyed()) return [];
    const nodes: IRowNode<Gstr2bReconciliationRow>[] = [];
    api.forEachNodeAfterFilter((node) => {
      if (node.data && canEditRow(node.data as Gstr2bReconciliationRow, isFinalized)) {
        nodes.push(node as IRowNode<Gstr2bReconciliationRow>);
      }
    });
    return nodes;
  }, [isFinalized]);

  const applyDecision = useCallback(
    (action: 'ACCEPT' | 'REJECT' | 'PENDING', nodes?: IRowNode<Gstr2bReconciliationRow>[]) => {
      const targets = nodes ?? editableNodes();
      const changes: RowChange[] = [];
      for (const node of targets) {
        const row = node.data;
        if (!row?.gstr2bInvoiceId || row.reconciliationAction === action) continue;
        changes.push({
          rowId: row.id,
          invoiceId: row.gstr2bInvoiceId,
          before: { reconciliationAction: row.reconciliationAction },
          after: { reconciliationAction: action },
        });
      }
      commit(`Marked ${changes.length} ${action.toLowerCase()}`, changes);
    },
    [commit, editableNodes],
  );

  /** Books-side corrections only. IMS is never written to. */
  const applyQuickFix = useCallback(
    (kind: 'match' | 'swap', nodes?: IRowNode<Gstr2bReconciliationRow>[]) => {
      const targets = nodes ?? editableNodes();
      const changes: RowChange[] = [];

      for (const node of targets) {
        const row = node.data;
        if (!row?.gstr2bInvoiceId) continue;

        let after: RowPatch | null = null;
        if (kind === 'match') {
          // Nothing on the IMS side to copy — copying zeros would wipe the GSTR-2B line.
          if (row.imsInvoiceId == null) continue;
          after = {
            gstr2bTaxableValue: row.imsTaxableValue,
            gstr2bIgst: row.imsIgst,
            gstr2bCgst: row.imsCgst,
            gstr2bSgst: row.imsSgst,
            gstr2bCess: row.imsCess,
          };
        } else if (row.gstr2bIgst > 0) {
          after = { gstr2bIgst: 0, gstr2bCgst: round2(row.gstr2bIgst / 2), gstr2bSgst: round2(row.gstr2bIgst / 2) };
        } else {
          after = { gstr2bIgst: round2(row.gstr2bCgst + row.gstr2bSgst), gstr2bCgst: 0, gstr2bSgst: 0 };
        }

        const before: RowPatch = {};
        for (const field of Object.keys(after) as (keyof Gstr2bReconciliationRow)[]) {
          (before as Record<string, unknown>)[field] = row[field];
        }
        changes.push({ rowId: row.id, invoiceId: row.gstr2bInvoiceId, before, after });
      }

      commit(kind === 'match' ? `Matched ${changes.length} to IMS` : `Swapped tax head on ${changes.length}`, changes);
    },
    [commit, editableNodes],
  );

  const runBucketBulk = useCallback(() => {
    if (activeBucket === 'ALL') return;
    const bulk = BUCKET_BULK[activeBucket];
    if (!bulk) return;
    const nodes = filteredNodes();
    if (bulk.kind === 'decision') applyDecision(bulk.action, nodes);
    else applyQuickFix(bulk.fix, nodes);
  }, [activeBucket, applyDecision, applyQuickFix, filteredNodes]);

  const replay = useCallback(
    (entry: HistoryEntry, direction: 'before' | 'after') => {
      applyLocal(entry.changes, direction);
      bulkMutation.mutate(
        entry.changes.map((change) => ({ invoiceId: change.invoiceId, patch: toPatch(change[direction]) })),
      );
    },
    [applyLocal, bulkMutation],
  );

  // Both read the stack outside the updater: a state updater can run twice under
  // StrictMode, and firing the PATCH from inside one would send it twice.
  const undo = useCallback(() => {
    const entry = undoStack[undoStack.length - 1];
    if (!entry) return;
    setUndoStack((stack) => stack.slice(0, -1));
    setRedoStack((stack) => [...stack, entry]);
    replay(entry, 'before');
  }, [replay, undoStack]);

  const redo = useCallback(() => {
    const entry = redoStack[redoStack.length - 1];
    if (!entry) return;
    setRedoStack((stack) => stack.slice(0, -1));
    setUndoStack((stack) => [...stack, entry]);
    replay(entry, 'after');
  }, [redoStack, replay]);

  /** A single in-cell edit still goes through the original per-invoice endpoint. */
  const onCellValueChanged = useCallback(
    (event: CellValueChangedEvent<Gstr2bReconciliationRow>) => {
      const row = event.data;
      const field = event.colDef.field;
      if (!row?.gstr2bInvoiceId || !field || !FIELD_MAP[field]) return;
      if (event.oldValue === event.newValue) return;

      const change: RowChange = {
        rowId: row.id,
        invoiceId: row.gstr2bInvoiceId,
        before: { [field]: event.oldValue } as RowPatch,
        after: { [field]: event.newValue } as RowPatch,
      };
      applyLocal([change], 'after');
      setUndoStack((stack) => [...stack, { label: `Edited ${field}`, changes: [change] }]);
      setRedoStack([]);
      updateMutation.mutate({ invoiceId: row.gstr2bInvoiceId, patch: toPatch(change.after) });
    },
    [applyLocal, updateMutation],
  );

  /* ── keyboard: decide without leaving the grid ── */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (event.repeat || tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (lens === 'vendors' || selection.count === 0 || isFinalized) return;

      const key = event.key.toLowerCase();
      if (key === 'a') {
        event.preventDefault();
        applyDecision('ACCEPT');
      } else if (key === 'r') {
        event.preventDefault();
        applyDecision('REJECT');
      } else if (key === 'p') {
        event.preventDefault();
        applyDecision('PENDING');
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [applyDecision, isFinalized, lens, redo, selection.count, undo]);

  /* ── navigation ── */
  const switchLens = useCallback((next: Lens) => {
    // Tabs give you the whole period back.
    setScopeVendor(null);
    setActiveBucket('ALL');
    setLens(next);
  }, []);

  const toggleBucket = useCallback((bucket: Gstr2bMatchStatus) => {
    setLens((current) => (current === 'vendors' ? 'decide' : current));
    setActiveBucket((current) => (current === bucket ? 'ALL' : bucket));
  }, []);

  const onRowClicked = useCallback(
    (event: RowClickedEvent) => {
      if (lens !== 'vendors' || event.node.rowPinned) return;
      const gstin = (event.data as { supplierGstin?: string | null })?.supplierGstin;
      if (!gstin) return;
      const target = event.event?.target as HTMLElement | null;
      if (target?.closest?.('.ag-selection-checkbox')) return;
      setScopeVendor(gstin);
      setActiveBucket('ALL');
      setLens('decide');
    },
    [lens],
  );

  const clearFilters = useCallback(() => {
    apiRef.current?.setFilterModel(null);
    setSearch('');
    setActiveBucket('ALL');
    setScopeVendor(null);
  }, []);

  const exportCsv = useCallback(() => {
    apiRef.current?.exportDataAsCsv({
      fileName: `gstr2b-ims-reconciliation-${retPeriod}.csv`,
      skipPinnedBottom: false,
    });
  }, [retPeriod]);

  const onGridReady = useCallback(
    (event: GridReadyEvent) => {
      apiRef.current = event.api;
      recomputeView();
    },
    [recomputeView],
  );

  const rowClassRules = useMemo(
    () => ({
      'recon-row-quiet': (params: RowClassParams) =>
        BUCKET_META[(params.data as Gstr2bReconciliationRow)?.matchStatus]?.rowClass === 'recon-row-quiet',
      'recon-row-risk': (params: RowClassParams) =>
        BUCKET_META[(params.data as Gstr2bReconciliationRow)?.matchStatus]?.rowClass === 'recon-row-risk',
      'recon-row-warn': (params: RowClassParams) =>
        BUCKET_META[(params.data as Gstr2bReconciliationRow)?.matchStatus]?.rowClass === 'recon-row-warn',
      'recon-row-head': (params: RowClassParams) =>
        BUCKET_META[(params.data as Gstr2bReconciliationRow)?.matchStatus]?.rowClass === 'recon-row-head',
      'recon-row-vendor': (params: RowClassParams) => String((params.data as { id?: string })?.id ?? '').startsWith('V-'),
    }),
    [],
  );

  // Stable identities: AG Grid treats a new array or function as a changed option.
  const pinnedBottomRowData = useMemo(() => [viewStats.pinned], [viewStats.pinned]);
  const getRowId = useCallback((params: GetRowIdParams) => String((params.data as { id: string }).id), []);
  const rowSelection = useMemo<RowSelectionOptions>(
    () => ({
      mode: 'multiRow',
      checkboxes: true,
      headerCheckbox: true,
      enableClickSelection: false,
      selectAll: 'filtered',
      // Vendor rows are a rollup — there is nothing to decide on one.
      isRowSelectable: () => lens !== 'vendors',
    }),
    [lens],
  );

  const busy = bulkMutation.isPending || updateMutation.isPending;
  const rowData = lens === 'vendors' ? vendorRows : rows;
  const totalRows = lens === 'vendors' ? vendorRows.length : rows.length;
  const showBulkBar = selection.count > 0 && lens !== 'vendors';

  const header = (
    <div className={styles.head}>
      <div className={styles.ctx}>
        <b>GSTR-2B ⇄ IMS reconciliation</b>
        {retPeriod} ·{' '}
        {isFinalized
          ? 'Period finalized — the corrected GSTR-2B data is locked.'
          : 'Correct the GSTR-2B side to match IMS, then finalize once every row has a decision.'}
      </div>
      <div className={styles.lens} role="group" aria-label="View">
        {LENSES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={styles.lensBtn}
            aria-pressed={lens === item.id}
            onClick={() => switchLens(item.id)}
          >
            {item.label}
            <small className={styles.lensHint}>{item.hint}</small>
          </button>
        ))}
      </div>
      <button
        type="button"
        className={styles.finalizeBtn}
        onClick={() => finalizeMutation.mutate()}
        disabled={isFinalized || finalizeMutation.isPending || rows.length === 0}
      >
        {isFinalized ? 'Finalized' : finalizeMutation.isPending ? 'Finalizing…' : 'Finalize corrected GSTR-2B'}
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className={styles.panel}>
        {header}
        <div className={styles.state}>
          <span className={styles.spinner} />
          <p className={styles.stateBody}>Loading reconciliation data…</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.panel}>
        {header}
        <div className={`${styles.state} ${styles.stateError}`}>
          <p className={styles.stateTitle}>Could not load the reconciliation</p>
          <p className={styles.stateDetail}>{describeApiError(error)}</p>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => refetch()}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className={styles.panel}>
        {header}
        <div className={styles.state}>
          <p className={styles.stateTitle}>Nothing to reconcile yet</p>
          <p className={styles.stateBody}>
            No invoice rows came back for {retPeriod}. Upload the GSTR-2B export on the Import tab, and sync IMS for the
            same period, to populate this view.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      {header}

      {!hasImsData && (
        <p className={styles.banner}>
          No IMS data found for {retPeriod} yet. Sync IMS for the same period on the IMS page to complete this
          reconciliation — until then every invoice below shows as “{BUCKET_META.ONLY_IN_2B.label}”.
        </p>
      )}

      {isFinalized && (
        <p className={`${styles.banner} ${styles.bannerLocked}`}>
          This period has been finalized. Values and decisions below are read-only.
        </p>
      )}

      <ReconBand
        summary={summary}
        retPeriod={retPeriod}
        activeBucket={activeBucket}
        onToggleBucket={toggleBucket}
        scopeLabel={scopeLabel}
        onClearScope={() => setScopeVendor(null)}
        statementOpen={statementOpen}
        onToggleStatement={() => setStatementOpen((open) => !open)}
      />

      {activeBucket !== 'ALL' && lens !== 'vendors' && (
        <ReconContextBar
          bucket={activeBucket}
          summary={summary}
          onRunBulk={runBucketBulk}
          onClear={() => setActiveBucket('ALL')}
          busy={busy}
          disabled={isFinalized}
        />
      )}

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <svg
            className={styles.searchIcon}
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="#0b1f3a"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L14 14" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search supplier, GSTIN, invoice…"
            aria-label="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className={styles.spacer} />
        <button type="button" className={styles.btn} onClick={undo} disabled={!undoStack.length}>
          Undo
        </button>
        <button type="button" className={styles.btn} onClick={redo} disabled={!redoStack.length}>
          Redo
        </button>
        <button type="button" className={styles.btn} onClick={() => setCompact((value) => !value)}>
          {compact ? 'Compact' : 'Comfortable'}
        </button>
        <button type="button" className={styles.btn} onClick={clearFilters}>
          Clear filters
        </button>
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={exportCsv}>
          Export CSV
        </button>
      </div>

      {showBulkBar && (
        <div className={styles.bulk}>
          <span className={styles.bulkCount}>
            {selection.count} selected <span>· ₹{moneyRounded(selection.exposure)} exposure</span>
          </span>
          <button type="button" className={styles.accept} onClick={() => applyDecision('ACCEPT')} disabled={isFinalized || busy}>
            Accept<kbd className={styles.kbd}>A</kbd>
          </button>
          <button type="button" className={styles.reject} onClick={() => applyDecision('REJECT')} disabled={isFinalized || busy}>
            Reject<kbd className={styles.kbd}>R</kbd>
          </button>
          <button type="button" onClick={() => applyDecision('PENDING')} disabled={isFinalized || busy}>
            Pending<kbd className={styles.kbd}>P</kbd>
          </button>
          <span className={styles.bulkSep} />
          <button type="button" onClick={() => applyQuickFix('match')} disabled={isFinalized || busy}>
            Match GSTR-2B to IMS
          </button>
          <button type="button" onClick={() => applyQuickFix('swap')} disabled={isFinalized || busy}>
            Swap tax head
          </button>
          <span className={styles.bulkNote}>IMS is read-only. Only GSTR-2B values can be corrected.</span>
        </div>
      )}

      <div className={styles.gridWrap}>
        <div className={`${styles.gridTheme} ag-theme-quartz ${isFetching || busy ? styles.busy : ''}`} style={{ height: 560 }}>
          <AgGridReact
            columnDefs={columnDefs}
            rowData={rowData}
            defaultColDef={defaultColDef}
            getRowId={getRowId}
            rowHeight={compact ? ROW_HEIGHT_COMPACT : ROW_HEIGHT_COMFORTABLE}
            rowClassRules={rowClassRules}
            rowSelection={rowSelection}
            selectionColumnDef={{ pinned: 'left', width: 46, resizable: false }}
            pinnedBottomRowData={pinnedBottomRowData}
            quickFilterText={search}
            isExternalFilterPresent={isExternalFilterPresent}
            doesExternalFilterPass={doesExternalFilterPass}
            pagination
            paginationPageSize={25}
            paginationPageSizeSelector={[10, 25, 50, 100]}
            stopEditingWhenCellsLoseFocus
            enableCellTextSelection
            animateRows
            tooltipShowDelay={300}
            multiSortKey="ctrl"
            onGridReady={onGridReady}
            onModelUpdated={recomputeView}
            onSelectionChanged={onSelectionChanged}
            onCellValueChanged={onCellValueChanged}
            onRowClicked={onRowClicked}
          />
        </div>
      </div>

      <div className={styles.summary}>
        <div>
          <span className={styles.statKey}>Rows shown</span>
          <span className={styles.statValue}>
            {viewStats.shown} / {totalRows}
          </span>
        </div>
        <div>
          <span className={styles.statKey}>At risk in view</span>
          <span className={`${styles.statValue} ${styles.statWarn}`}>₹{moneyRounded(viewStats.risk)}</span>
        </div>
        <div>
          <span className={styles.statKey}>Unclaimed in view</span>
          <span className={`${styles.statValue} ${styles.statOk}`}>₹{moneyRounded(viewStats.unclaimed)}</span>
        </div>
        <div>
          <span className={styles.statKey}>Decided</span>
          <span className={styles.statValue}>
            {lens === 'vendors' ? '—' : `${viewStats.decided} / ${viewStats.shown}`}
          </span>
        </div>
        <p className={styles.note}>
          Nothing is hidden. All {rows.length} invoices are loaded — they are ranked, so the settled ones sit at the
          bottom.
        </p>
      </div>

      <p className={styles.ceiling}>
        <b>At risk</b> is credit this reconciliation cannot support, added up head by head. <b>Unclaimed</b> is credit
        available that has not been claimed. A place-of-supply error shows as at-risk IGST <i>and</i> unclaimed
        CGST/SGST on the same invoice, which is why the net tax difference alone would read as zero.
      </p>
    </div>
  );
}
