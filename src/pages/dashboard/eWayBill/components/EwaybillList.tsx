import { useMemo } from 'react';
import type { ColDef } from 'ag-grid-community';
import { DataTable, column } from '@/components/UnifiedTable';
import type { EWayBillFiling, EWayBillRecord } from '../types/ewaybill.types';

interface EwaybillListProps {
  filing: EWayBillFiling | null;
  records: EWayBillRecord[];
  loading: boolean;
  periodLabel: string;
  /** Renders bare, without card chrome or header, for nesting inside another card. */
  embedded?: boolean;
}

export function EwaybillList({
  filing,
  records,
  loading,
  periodLabel,
  embedded = false,
}: EwaybillListProps) {
  const columnDefs: ColDef[] = useMemo(
    () => [
      column.text('ewbNo', 'E-Way Bill No.', { minWidth: 150 }),
      column.date('ewbDate', 'EWB Date'),
      column.text('docNo', 'Doc No.'),
      column.date('docDate', 'Doc Date'),
      // The trade name is the useful detail behind a GSTIN, so it stays as the
      // cell tooltip exactly as the old markup had it.
      column.text('fromGstin', 'From GSTIN', { minWidth: 160, tooltipField: 'fromTrdName' }),
      column.text('toGstin', 'To GSTIN', { minWidth: 160, tooltipField: 'toTrdName' }),
      column.amount('totInvValue', 'Invoice Value'),
      column.tag('status', 'Status'),
      column.date('validUpto', 'Valid Upto'),
      column.text('source', 'Source'),
    ],
    [],
  );

  const emptyMessage = filing
    ? 'This filing has no e-way bill rows.'
    : 'Upload a file or sync from the GST portal to see e-way bills here.';

  const subtitle = filing
    ? `${records.length} e-way bill${records.length === 1 ? '' : 's'} for ${periodLabel} · Status: ${filing.syncStatus}`
    : `No e-way bill data loaded for ${periodLabel}`;

  return (
    <DataTable
      rowData={records}
      columnDefs={columnDefs}
      loading={loading}
      loadingMessage="Loading e-way bills…"
      emptyMessage={emptyMessage}
      title="E-Way Bills"
      subtitle={subtitle}
      hideHeader={embedded}
      variant={embedded ? 'nested' : 'standalone'}
    />
  );
}
