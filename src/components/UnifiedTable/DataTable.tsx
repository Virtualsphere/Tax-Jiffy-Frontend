import { useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import { UnifiedTable, type UnifiedTableProps } from './UnifiedTable';
import { TagCellRenderer } from './TagCellRenderer';
import styles from './DataTable.module.css';

export interface DataTableProps extends Omit<UnifiedTableProps, 'onSearch' | 'onFilterChange'> {
  /** Client-side search across every cell value. On by default. */
  searchable?: boolean;
  /** Shown instead of the grid while data is being fetched. */
  loading?: boolean;
  loadingMessage?: string;
  /** Shown instead of the grid when there is nothing to display. */
  emptyMessage?: string;
}

/**
 * The app's one data table.
 *
 * `UnifiedTable` is the presentation layer (AG Grid plus the GSTR-1 toolbar,
 * pagination and fullscreen chrome). Every page using it had to reimplement
 * client-side search on top — the GSTR-1 tabs do it inline — while other pages
 * hand-rolled plain `<table>` markup and got no search, sorting or pagination at
 * all. `DataTable` folds that shared behaviour in, so a list is one component
 * call and every list in the app looks and behaves the same.
 */
export function DataTable({
  rowData,
  columnDefs,
  searchable = true,
  loading = false,
  loadingMessage = 'Loading…',
  emptyMessage = 'No records to display.',
  recordCount,
  ...rest
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    const rows = rowData ?? [];
    if (!searchable || !searchTerm.trim()) return rows;

    const needle = searchTerm.trim().toLowerCase();
    return rows.filter((row) =>
      Object.values(row ?? {}).some(
        (value) => value != null && String(value).toLowerCase().includes(needle),
      ),
    );
  }, [rowData, searchTerm, searchable]);

  if (loading) {
    return <div className={styles.stateMessage}>{loadingMessage}</div>;
  }

  if (!rowData?.length) {
    return <div className={styles.stateMessage}>{emptyMessage}</div>;
  }

  return (
    <UnifiedTable
      {...rest}
      rowData={filteredData}
      columnDefs={columnDefs}
      recordCount={recordCount ?? filteredData.length}
      onSearch={searchable ? setSearchTerm : undefined}
    />
  );
}

/* ── Column helpers ────────────────────────────────────────────────────────
   So pages describe columns the same way instead of repeating alignment and
   formatting options at every call site. */

const LEFT = { cellClass: 'ag-cell-left', headerClass: 'ag-header-cell-left' };
const RIGHT = { cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right' };

/** Renders null/undefined/empty as an em dash rather than a blank cell. */
function dash(value: unknown): string {
  if (value == null || value === '') return '—';
  return String(value);
}

export const column = {
  /** Left-aligned text. */
  text(field: string, headerName: string, extra?: Partial<ColDef>): ColDef {
    return { field, headerName, ...LEFT, valueFormatter: (p) => dash(p.value), ...extra };
  },

  /** Right-aligned money, formatted to the Indian locale with 2 decimals. */
  amount(field: string, headerName: string, extra?: Partial<ColDef>): ColDef {
    return {
      field,
      headerName,
      ...RIGHT,
      valueFormatter: (p) =>
        p.value == null
          ? '—'
          : Number(p.value).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
      ...extra,
    };
  },

  /** Right-aligned plain number. */
  number(field: string, headerName: string, extra?: Partial<ColDef>): ColDef {
    return {
      field,
      headerName,
      ...RIGHT,
      valueFormatter: (p) => (p.value == null ? '—' : Number(p.value).toLocaleString('en-IN')),
      ...extra,
    };
  },

  /** Date rendered dd MMM yyyy; passes through strings it cannot parse. */
  date(field: string, headerName: string, extra?: Partial<ColDef>): ColDef {
    return {
      field,
      headerName,
      ...LEFT,
      valueFormatter: (p) => {
        if (!p.value) return '—';
        const parsed = Date.parse(String(p.value));
        if (!Number.isFinite(parsed)) return String(p.value);
        return new Date(parsed).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      },
      ...extra,
    };
  },

  /** Status pill, using the shared tag renderer. */
  tag(field: string, headerName: string, extra?: Partial<ColDef>): ColDef {
    return { field, headerName, ...LEFT, cellRenderer: TagCellRenderer, ...extra };
  },

  /** A column of buttons or other custom content; never sorted or filtered. */
  actions(headerName: string, renderer: ColDef['cellRenderer'], extra?: Partial<ColDef>): ColDef {
    return {
      headerName,
      ...RIGHT,
      cellRenderer: renderer,
      sortable: false,
      filter: false,
      resizable: false,
      ...extra,
    };
  },
};
