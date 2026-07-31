import { useMemo, useState, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ColGroupDef } from 'ag-grid-community';
import styles from '../GSTR1Page.module.css';

interface GSTR1OthersTabProps {
  data: any;
  expandedAccordion: string | null;
  setExpandedAccordion: (val: string | null) => void;
}

/** Sizes to content; only scrolls for large datasets */
const DynamicAgGrid = (props: any) => {
  const [cw, setCw] = useState<string>('100%');
  const updateWidth = useCallback((params: any) => {
    requestAnimationFrame(() => {
      if (!params.api) return;
      const colState: any[] = params.api.getColumnState?.() ?? [];
      const total = colState
        .filter((c: any) => !c.hide)
        .reduce((sum: number, c: any) => sum + (c.width ?? 0), 0);
      if (total > 0) setCw(`${total + 2}px`);
    });
  }, []);
  const maxRows = 10;
  const isLarge = props.rowData && props.rowData.length > maxRows;
  const innerStyle = {
    width: cw,
    maxWidth: '100%',
    height: isLarge ? '380px' : 'auto',
    marginBottom: props.marginBottom || '0',
  };
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <div className="ag-theme-tax-jiffy ag-theme-blue-group-headers" style={innerStyle}>
        <AgGridReact
          {...props}
          domLayout={isLarge ? 'normal' : 'autoHeight'}
          rowHeight={32}
          autoSizeStrategy={{ type: 'fitCellContents' }}
          onGridReady={updateWidth}
          onFirstDataRendered={updateWidth}
          onColumnResized={updateWidth}
        />
      </div>
    </div>
  );
};

export function GSTR1OthersTab({ data, expandedAccordion, setExpandedAccordion }: GSTR1OthersTabProps) {

  const defaultColDef = useMemo<ColDef>(() => ({
    wrapHeaderText: true,
    autoHeaderHeight: true,
    minWidth: 80,
    resizable: true,
    suppressSizeToFit: true,
  }), []);

  const colDefs12 = useMemo<(ColDef | ColGroupDef)[]>(() => [
    {
      headerName: 'Items',
      children: [
        { field: 'srNo',        headerName: 'Sr.',         valueGetter: 'node.rowIndex + 1', minWidth: 50, maxWidth: 60,  cellClass: styles.centered, headerClass: styles.centered },
        { field: 'hsn',         headerName: 'HSN',         minWidth: 70, maxWidth: 100,                cellClass: styles.centered, headerClass: styles.centered },
        { field: 'description', headerName: 'Description', minWidth: 160 },
        { field: 'uqc',         headerName: 'UQC',         minWidth: 60,  maxWidth: 80,                   cellClass: styles.centered, headerClass: styles.centered },
      ]
    },
    {
      headerName: 'Qty & Value',
      children: [
        { field: 'totalQuantity', headerName: 'Qty',   minWidth: 80,  maxWidth: 110, cellClass: styles.centered, headerClass: styles.centered },
        { field: 'totalValue',    headerName: 'Value', minWidth: 100, maxWidth: 140 },
      ]
    },
    {
      headerName: 'Tax Details',
      children: [
        { field: 'taxableValue',  headerName: 'Taxable Value', minWidth: 110 },
        { field: 'integratedTax', headerName: 'IGST',          minWidth: 90,  maxWidth: 120, cellClass: styles.centered, headerClass: styles.centered },
        { field: 'centralTax',    headerName: 'CGST',          minWidth: 90,  maxWidth: 120, cellClass: styles.centered, headerClass: styles.centered },
        { field: 'stateTax',      headerName: 'SGST/UT',       minWidth: 90,  maxWidth: 120, cellClass: styles.centered, headerClass: styles.centered },
        { field: 'cess',          headerName: 'Cess',          minWidth: 80,  maxWidth: 100, cellClass: styles.centered, headerClass: styles.centered },
      ]
    }
  ], []);

  const colDefs13 = useMemo<(ColDef | ColGroupDef)[]>(() => [
    { field: 'srNo',             headerName: 'Sr.',              valueGetter: 'node.rowIndex + 1', minWidth: 50, maxWidth: 60,  cellClass: styles.centered, headerClass: styles.centered },
    { field: 'natureOfDocument', headerName: 'Nature of Document', minWidth: 200 },
    {
      headerName: 'Sr. No. Range',
      children: [
        { field: 'from', headerName: 'From', minWidth: 70, maxWidth: 100, cellClass: styles.centered, headerClass: styles.centered },
        { field: 'to',   headerName: 'To',   minWidth: 70, maxWidth: 100, cellClass: styles.centered, headerClass: styles.centered },
      ]
    },
    { field: 'totalNumber', headerName: 'Total',     minWidth: 75, maxWidth: 100, cellClass: styles.centered, headerClass: styles.centered },
    { field: 'cancelled',   headerName: 'Cancelled', minWidth: 85, maxWidth: 110, cellClass: styles.centered, headerClass: styles.centered },
    { field: 'netIssued',   headerName: 'Net Issued', minWidth: 90, maxWidth: 110, cellClass: styles.centered, headerClass: styles.centered },
  ], []);

  const AccordionIcon = ({ expanded }: { expanded: boolean }) => (
    <div className={`${styles.accordionIcon} ${expanded ? styles.accordionIconExpanded : ''}`}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );

  return (
    <div className={styles.outwardTabContent}>
      {/* Table 12 */}
      <div className={styles.accordion}>
        <div className={styles.accordionHeader} onClick={() => setExpandedAccordion(expandedAccordion === 'table12' ? null : 'table12')} role="button" tabIndex={0}>
          <AccordionIcon expanded={expandedAccordion === 'table12'} />
          <div className={styles.accordionTitleGroup}>
            <p className={styles.accordionTitle}>12. HSN-wise summary of outward supplies</p>
            <p className={styles.accordionSubtitle}>Summary of outward supplies of goods and/or services based on HSN</p>
          </div>
        </div>
        {expandedAccordion === 'table12' && (
          <div className={styles.accordionContent}>
            <DynamicAgGrid
              defaultColDef={defaultColDef}
              rowData={data.table12.records}
              columnDefs={colDefs12}
              suppressMenuHide={true}
              theme="legacy"
              pinnedBottomRowData={[{
                hsn: 'Total',
                totalQuantity: data.table12.total.totalQuantity,
                totalValue:    data.table12.total.totalValue,
                taxableValue:  data.table12.total.taxableValue,
                integratedTax: data.table12.total.integratedTax,
                centralTax:    data.table12.total.centralTax,
                stateTax:      data.table12.total.stateTax,
                cess:          data.table12.total.cess,
              }]}
            />
          </div>
        )}
      </div>

      {/* Table 13 */}
      <div className={styles.accordion}>
        <div className={styles.accordionHeader} onClick={() => setExpandedAccordion(expandedAccordion === 'table13' ? null : 'table13')} role="button" tabIndex={0}>
          <AccordionIcon expanded={expandedAccordion === 'table13'} />
          <div className={styles.accordionTitleGroup}>
            <p className={styles.accordionTitle}>13. Documents issued during the tax period</p>
            <p className={styles.accordionSubtitle}>Details of documents like invoices, debit notes, credit notes, etc. issued</p>
          </div>
        </div>
        {expandedAccordion === 'table13' && (
          <div className={styles.accordionContent}>
            <DynamicAgGrid
              defaultColDef={defaultColDef}
              rowData={data.table13.records}
              columnDefs={colDefs13}
              suppressMenuHide={true}
              theme="legacy"
            />
          </div>
        )}
      </div>
    </div>
  );
}
