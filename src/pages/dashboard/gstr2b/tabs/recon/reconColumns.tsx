import type { CellClassParams, ColDef, ColGroupDef, EditableCallbackParams } from 'ag-grid-community';
import type { Gstr2bMatchStatus, Gstr2bReconciliationRow } from '../../types/gstr2b-filing.types';
import {
  BucketCell,
  DeltaCell,
  EligibilityCell,
  ExceptionsCell,
  OpenInvoicesCell,
  RiskCell,
  SupplierCell,
  UnclaimedCell,
  VendorDecidedCell,
} from './reconRenderers';
import { dateFormatter, moneyCellClass, moneyFormatter } from './reconFormatters';
import { BUCKET_META } from './reconMeta';
import styles from './Recon.module.css';

export type Lens = 'decide' | 'vendors' | 'audit';

/**
 * Only the GSTR-2B side of a row is correctable, and only while the period is open —
 * an IMS-only row has no GSTR-2B line to patch. Mirrors the API's update contract.
 */
export function canEditRow(row: Gstr2bReconciliationRow | undefined, isFinalized: boolean): boolean {
  return !isFinalized && !!row && row.gstr2bInvoiceId != null;
}

function editableCallback(isFinalized: boolean) {
  return (params: EditableCallbackParams<Gstr2bReconciliationRow>) =>
    !params.node.rowPinned && canEditRow(params.data, isFinalized);
}

function editableCellClass(isFinalized: boolean) {
  return (params: CellClassParams<Gstr2bReconciliationRow>): string[] => {
    const classes = [moneyCellClass(params)];
    if (params.node.rowPinned) return classes;
    classes.push(canEditRow(params.data, isFinalized) ? 'recon-cell-edit' : 'recon-cell-locked');
    return classes;
  };
}

function moneyColumn(field: string, headerName: string, extra: ColDef = {}): ColDef {
  return {
    field,
    headerName,
    width: 126,
    type: 'rightAligned',
    valueFormatter: moneyFormatter,
    cellClass: moneyCellClass,
    filter: 'agNumberColumnFilter',
    ...extra,
  };
}

/** A GSTR-2B amount: editable in place while the period is open. */
function editableColumn(isFinalized: boolean, field: string, headerName: string, extra: ColDef = {}): ColDef {
  return moneyColumn(field, headerName, {
    editable: editableCallback(isFinalized),
    cellEditor: 'agNumberCellEditor',
    cellEditorParams: { precision: 2, min: 0 },
    cellClass: editableCellClass(isFinalized),
    headerTooltip: 'Correctable — the GSTR-2B side is what gets amended',
    ...extra,
  });
}

/** An IMS amount: the reference side, never written to from here. */
function lockedColumn(field: string, headerName: string, extra: ColDef = {}): ColDef {
  return moneyColumn(field, headerName, {
    editable: false,
    headerClass: 'recon-header-locked',
    headerTooltip: 'From IMS — cannot be edited here',
    ...extra,
  });
}

function deltaColumn(field: string, headerName: string, extra: ColDef = {}): ColDef {
  return {
    field,
    headerName,
    width: 126,
    type: 'rightAligned',
    cellRenderer: DeltaCell,
    filter: 'agNumberColumnFilter',
    headerTooltip: 'Difference for this tax head, as computed by the reconciliation service',
    ...extra,
  };
}

const SUPPLIER_COLUMN: ColDef = {
  field: 'supplierGstin',
  headerName: 'Supplier & GSTIN',
  width: 250,
  pinned: 'left',
  cellRenderer: SupplierCell,
  filter: 'agTextColumnFilter',
  // Search and text filters have to see the trade name as well as the GSTIN.
  valueGetter: (params) =>
    params.data ? `${params.data.supplierName ?? ''} ${params.data.supplierGstin ?? ''}`.trim() : '',
};

function decisionColumn(isFinalized: boolean): ColDef {
  return {
    field: 'reconciliationAction',
    headerName: 'Decision',
    width: 138,
    pinned: 'right',
    editable: editableCallback(isFinalized),
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: { values: ['ACCEPT', 'REJECT', 'PENDING'] },
    filter: 'agTextColumnFilter',
    cellStyle: (params) => {
      if (params.node.rowPinned) return null;
      if (params.data?.matchStatus === 'MATCHED' && params.value === 'PENDING') {
        return { color: '#98a3b4', fontWeight: 550 };
      }
      if (params.value === 'ACCEPT') return { color: '#0f766e', fontWeight: 600 };
      if (params.value === 'REJECT') return { color: '#be123c', fontWeight: 600 };
      return { color: '#6b7a93', fontWeight: 600 };
    },
  };
}

function remarksColumn(isFinalized: boolean): ColDef {
  return {
    field: 'remarks',
    headerName: 'Remarks',
    minWidth: 200,
    flex: 1,
    editable: editableCallback(isFinalized),
    filter: 'agTextColumnFilter',
    cellEditor: 'agLargeTextCellEditor',
    cellEditorPopup: true,
    cellEditorParams: { maxLength: 180, rows: 4, cols: 44 },
    cellClass: (params: CellClassParams<Gstr2bReconciliationRow>) =>
      !params.node.rowPinned && canEditRow(params.data, isFinalized) ? 'recon-cell-edit' : '',
  };
}

const BUCKET_COLUMN: ColDef = {
  field: 'matchStatus',
  headerName: 'Difference in',
  width: 190,
  cellRenderer: BucketCell,
  filter: 'agTextColumnFilter',
  // Filter and search on the label a user can actually see, not the raw enum.
  valueFormatter: (params) => BUCKET_META[params.value as Gstr2bMatchStatus]?.label ?? '',
  filterValueGetter: (params) => BUCKET_META[params.data?.matchStatus as Gstr2bMatchStatus]?.label ?? '',
  getQuickFilterText: (params) => BUCKET_META[params.value as Gstr2bMatchStatus]?.label ?? '',
};

const AT_RISK_COLUMN: ColDef = {
  field: 'atRisk',
  headerName: 'At risk',
  width: 136,
  type: 'rightAligned',
  cellRenderer: RiskCell,
  filter: 'agNumberColumnFilter',
  headerTooltip: 'Credit claimed that this reconciliation does not support',
};

const UNCLAIMED_COLUMN: ColDef = {
  field: 'unclaimed',
  headerName: 'Unclaimed',
  width: 136,
  type: 'rightAligned',
  cellRenderer: UnclaimedCell,
  filter: 'agNumberColumnFilter',
  headerTooltip: 'Credit available that has not been claimed',
};

/** Work the queue: what needs a decision, and nothing else. */
export function decideColumns(isFinalized: boolean): (ColDef | ColGroupDef)[] {
  return [
    SUPPLIER_COLUMN,
    { field: 'invoiceNumber', headerName: 'Invoice no.', width: 150, cellClass: styles.num, filter: 'agTextColumnFilter' },
    BUCKET_COLUMN,
    AT_RISK_COLUMN,
    UNCLAIMED_COLUMN,
    lockedColumn('imsTotalTax', 'Tax in IMS', { width: 134 }),
    remarksColumn(isFinalized),
    decisionColumn(isFinalized),
  ];
}

/** The full ledger: both sides, every head, with the difference spelled out. */
export function auditColumns(isFinalized: boolean): (ColDef | ColGroupDef)[] {
  return [
    SUPPLIER_COLUMN,
    { field: 'invoiceNumber', headerName: 'Invoice no.', width: 150, cellClass: styles.num, filter: 'agTextColumnFilter' },
    {
      field: 'invoiceDate',
      headerName: 'Invoice date',
      width: 132,
      valueFormatter: dateFormatter,
      cellClass: styles.num,
      filter: 'agTextColumnFilter',
    },
    BUCKET_COLUMN,
    {
      headerName: 'As per GSTR-2B · editable',
      marryChildren: true,
      children: [
        editableColumn(isFinalized, 'gstr2bTaxableValue', 'Taxable value', { width: 140 }),
        editableColumn(isFinalized, 'gstr2bIgst', 'IGST', { columnGroupShow: 'open' }),
        editableColumn(isFinalized, 'gstr2bCgst', 'CGST', { columnGroupShow: 'open' }),
        editableColumn(isFinalized, 'gstr2bSgst', 'SGST', { columnGroupShow: 'open' }),
        editableColumn(isFinalized, 'gstr2bCess', 'Cess', { columnGroupShow: 'open', width: 112 }),
        moneyColumn('gstr2bTotalTax', 'Total tax', { width: 134 }),
      ],
    },
    {
      headerName: 'As per IMS · read-only',
      marryChildren: true,
      children: [
        lockedColumn('imsTaxableValue', 'Taxable value', { width: 140 }),
        lockedColumn('imsIgst', 'IGST', { columnGroupShow: 'open' }),
        lockedColumn('imsCgst', 'CGST', { columnGroupShow: 'open' }),
        lockedColumn('imsSgst', 'SGST', { columnGroupShow: 'open' }),
        lockedColumn('imsCess', 'Cess', { columnGroupShow: 'open', width: 112 }),
        lockedColumn('imsTotalTax', 'Total tax', { width: 134 }),
      ],
    },
    {
      headerName: 'Difference',
      marryChildren: true,
      children: [
        deltaColumn('deltaTaxable', 'Taxable value', { width: 140, columnGroupShow: 'open' }),
        deltaColumn('deltaIgst', 'IGST', { columnGroupShow: 'open' }),
        deltaColumn('deltaCgst', 'CGST', { columnGroupShow: 'open' }),
        deltaColumn('deltaSgst', 'SGST', { columnGroupShow: 'open' }),
        deltaColumn('deltaCess', 'Cess', { columnGroupShow: 'open', width: 112 }),
        { ...AT_RISK_COLUMN, width: 132 },
        { ...UNCLAIMED_COLUMN, width: 132 },
      ],
    },
    {
      field: 'itcAvailability',
      headerName: 'ITC eligibility',
      width: 160,
      cellRenderer: EligibilityCell,
      filter: 'agTextColumnFilter',
    },
    remarksColumn(isFinalized),
    decisionColumn(isFinalized),
  ];
}

/** Chase suppliers: one row per vendor, pre-aggregated in JS. */
export function vendorColumns(): (ColDef | ColGroupDef)[] {
  return [
    { ...SUPPLIER_COLUMN, headerName: 'Vendor & GSTIN', width: 280 },
    { field: 'invoices', headerName: 'Invoices', width: 116, type: 'rightAligned', cellClass: styles.num, filter: 'agNumberColumnFilter' },
    {
      field: 'exceptions',
      headerName: 'Exceptions',
      width: 130,
      type: 'rightAligned',
      cellRenderer: ExceptionsCell,
      filter: 'agNumberColumnFilter',
    },
    { ...AT_RISK_COLUMN, width: 146 },
    { ...UNCLAIMED_COLUMN, width: 146 },
    {
      field: 'topIssue',
      headerName: 'Most common issue',
      width: 200,
      cellRenderer: BucketCell,
      filter: 'agTextColumnFilter',
      valueFormatter: (params) => BUCKET_META[params.value as Gstr2bMatchStatus]?.label ?? '',
      filterValueGetter: (params) => BUCKET_META[params.data?.topIssue as Gstr2bMatchStatus]?.label ?? '',
      getQuickFilterText: (params) => BUCKET_META[params.value as Gstr2bMatchStatus]?.label ?? '',
    },
    {
      field: 'decided',
      headerName: 'Decided',
      width: 130,
      type: 'rightAligned',
      cellRenderer: VendorDecidedCell,
      filter: 'agNumberColumnFilter',
    },
    {
      colId: 'openInvoices',
      headerName: '',
      width: 140,
      pinned: 'right',
      sortable: false,
      filter: false,
      cellRenderer: OpenInvoicesCell,
    },
  ];
}
