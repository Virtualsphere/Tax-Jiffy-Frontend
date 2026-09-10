import { useMemo } from 'react';
import type { ColDef, ValueGetterParams } from 'ag-grid-community';
import { DataTable, column } from '@/components/UnifiedTable';
import type { PrB2b, PurchaseRegisterFiling } from '@/pages/dashboard/purchaseRegister/api/purchaseRegisterApi';

interface Gstr2bInvoiceListProps {
  filing: PurchaseRegisterFiling | null;
  invoices: PrB2b[];
  loading: boolean;
  retPeriod: string;
  /** Renders bare, without card chrome or header, for nesting inside another card. */
  embedded?: boolean;
}

export function Gstr2bInvoiceList({ filing, invoices, loading, retPeriod, embedded = false }: Gstr2bInvoiceListProps) {
  const columnDefs: ColDef[] = useMemo(
    () => [
      column.text('gstinOfSupplier', 'Supplier GSTIN', { minWidth: 160 }),
      column.text('invoiceNumber', 'Invoice No.'),
      column.date('invoiceDate', 'Invoice Date'),
      column.amount('taxableValue', 'Taxable Value'),
      {
        // Total tax is the sum of the four heads; there is no such field on the row.
        ...column.amount('totalTax', 'Total Tax'),
        field: undefined,
        colId: 'totalTax',
        valueGetter: (p: ValueGetterParams<PrB2b>) =>
          (p.data?.integratedTaxPaid ?? 0) +
          (p.data?.centralTaxPaid ?? 0) +
          (p.data?.stateUtTaxPaid ?? 0) +
          (p.data?.cessPaid ?? 0),
      },
      column.tag('eligibilityForItc', 'ITC Eligibility'),
    ],
    [],
  );

  const emptyMessage = filing
    ? 'This period has a filing but no B2B invoice rows yet.'
    : 'Upload a GSTR-2B file to see invoices here.';

  const subtitle = filing
    ? `${invoices.length} invoice${invoices.length === 1 ? '' : 's'} for period ${retPeriod} · Status: ${filing.filingStatus}`
    : `No data uploaded yet for period ${retPeriod}`;

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
