import { useMemo } from 'react';
import type { ColDef, ValueGetterParams } from 'ag-grid-community';
import { DataTable, column } from '@/components/UnifiedTable';
import type { ImsFiling, ImsInvoice } from '../types/ims.types';

interface ImsInvoiceListProps {
  filing: ImsFiling | null;
  invoices: ImsInvoice[];
  loading: boolean;
  retPeriod: string;
  /** Renders bare, without card chrome or header, for nesting inside another card. */
  embedded?: boolean;
}

export function ImsInvoiceList({ filing, invoices, loading, retPeriod, embedded = false }: ImsInvoiceListProps) {
  const columnDefs: ColDef[] = useMemo(
    () => [
      column.text('section', 'Section'),
      column.text('supplierGstin', 'Supplier GSTIN', { minWidth: 160 }),
      column.text('invoiceNumber', 'Invoice No.'),
      column.date('invoiceDate', 'Invoice Date'),
      column.amount('taxableValue', 'Taxable Value'),
      {
        // Total tax is the sum of the four heads; there is no such field on the row.
        ...column.amount('totalTax', 'Total Tax'),
        field: undefined,
        colId: 'totalTax',
        valueGetter: (p: ValueGetterParams<ImsInvoice>) =>
          (p.data?.integratedTax ?? 0) +
          (p.data?.centralTax ?? 0) +
          (p.data?.stateUtTax ?? 0) +
          (p.data?.cess ?? 0),
      },
      column.tag('imsAction', 'IMS Action'),
      column.text('source', 'Source'),
    ],
    [],
  );

  const emptyMessage = filing
    ? 'This period has a filing but no invoice rows yet.'
    : 'Upload a file or sync from the GST portal to see invoices here.';

  const subtitle = filing
    ? `${invoices.length} invoice${invoices.length === 1 ? '' : 's'} for period ${retPeriod} · Status: ${filing.syncStatus}`
    : `No data uploaded or synced yet for period ${retPeriod}`;

  return (
    <DataTable
      rowData={invoices}
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
