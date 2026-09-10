import { useMemo } from 'react';
import type { ColDef } from 'ag-grid-community';
import { DataTable, column } from '@/components/UnifiedTable';
import type { EinvoiceFiling, EinvoiceIrn } from '../types/einvoice.types';

interface EinvoiceListProps {
  filing: EinvoiceFiling | null;
  irns: EinvoiceIrn[];
  loading: boolean;
  retPeriod: string;
  /** Renders bare, without card chrome or header, for nesting inside another card. */
  embedded?: boolean;
}

export function EinvoiceList({ filing, irns, loading, retPeriod, embedded = false }: EinvoiceListProps) {
  const columnDefs: ColDef[] = useMemo(
    () => [
      column.text('irn', 'IRN', { minWidth: 260, tooltipField: 'irn' }),
      column.text('supplierGstin', 'Supplier GSTIN', { minWidth: 160 }),
      column.text('docNum', 'Doc No.'),
      column.date('docDate', 'Doc Date'),
      column.amount('totInvAmt', 'Total Value'),
      column.tag('irnStatus', 'Status'),
      column.text('source', 'Source'),
    ],
    [],
  );

  const emptyMessage = filing
    ? 'This period has a filing but no invoice rows yet.'
    : 'Upload a file or sync from the GST portal to see invoices here.';

  const subtitle = filing
    ? `${irns.length} invoice${irns.length === 1 ? '' : 's'} for period ${retPeriod} · Status: ${filing.syncStatus}`
    : `No data uploaded or synced yet for period ${retPeriod}`;

  return (
    <DataTable
      rowData={irns}
      columnDefs={columnDefs}
      loading={loading}
      loadingMessage="Loading invoices…"
      emptyMessage={emptyMessage}
      title="Invoices"
      subtitle={subtitle}
      hideHeader={embedded}
      variant={embedded ? 'nested' : 'standalone'}
    />
  );
}
