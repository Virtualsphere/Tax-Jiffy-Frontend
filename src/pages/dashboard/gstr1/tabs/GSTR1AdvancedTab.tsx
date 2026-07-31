import { useMemo, useState, useCallback } from 'react';
import { AnimatedExpandable } from '@/components/AnimatedExpandable/AnimatedExpandable';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ColGroupDef } from 'ag-grid-community';
import styles from '../GSTR1Page.module.css';

interface GSTR1AdvancedTabProps {
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

export function GSTR1AdvancedTab({ data, expandedAccordion, setExpandedAccordion }: GSTR1AdvancedTabProps) {

  const defaultColDef = useMemo<ColDef>(() => ({
    wrapHeaderText: true,
    autoHeaderHeight: true,
    minWidth: 80,
    resizable: true,
    suppressSizeToFit: true,
  }), []);

  const colDefs11 = useMemo<(ColDef | ColGroupDef)[]>(() => [
    { field: 'rate',         headerName: 'RATE',                           minWidth: 80,  maxWidth: 100, cellClass: styles.centered, headerClass: styles.centered },
    { field: 'grossAdvance', headerName: 'GROSS ADVANCE RECEIVED/ADJUSTED', minWidth: 160 },
    { field: 'pos',          headerName: 'PLACE OF SUPPLY',                 minWidth: 130, cellClass: styles.centered, headerClass: styles.centered },
    {
      headerName: 'AMOUNT',
      children: [
        { field: 'integrated', headerName: 'IGST',    minWidth: 90, maxWidth: 120, cellClass: styles.centered, headerClass: styles.centered },
        { field: 'central',    headerName: 'CGST',    minWidth: 90, maxWidth: 120, cellClass: styles.centered, headerClass: styles.centered },
        { field: 'state',      headerName: 'SGST/UT', minWidth: 90, maxWidth: 120, cellClass: styles.centered, headerClass: styles.centered },
        { field: 'cess',       headerName: 'CESS',    minWidth: 80, maxWidth: 100, cellClass: styles.centered, headerClass: styles.centered },
      ]
    }
  ], []);

  const colDefs11Amendments = useMemo<ColDef[]>(() => [
    { field: 'month',              headerName: 'Month',         minWidth: 90, maxWidth: 110, cellClass: styles.centered, headerClass: styles.centered },
    { field: 'amendmentRelatingTo', headerName: 'Amendment Relating To (S. No.)', minWidth: 200 },
    { field: 'val11A1', headerName: '11A(1)', minWidth: 80, maxWidth: 100, cellClass: styles.centered, headerClass: styles.centered },
    { field: 'val11A2', headerName: '11A(2)', minWidth: 80, maxWidth: 100, cellClass: styles.centered, headerClass: styles.centered },
    { field: 'val11B1', headerName: '11B(1)', minWidth: 80, maxWidth: 100, cellClass: styles.centered, headerClass: styles.centered },
    { field: 'val11B2', headerName: '11B(2)', minWidth: 80, maxWidth: 100, cellClass: styles.centered, headerClass: styles.centered },
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
      {/* Table 11 */}
      <div className={styles.accordion}>
        <div className={styles.accordionHeader} onClick={() => setExpandedAccordion(expandedAccordion === 'table11' ? null : 'table11')} role="button" tabIndex={0}>
          <AccordionIcon expanded={expandedAccordion === 'table11'} />
          <div className={styles.accordionTitleGroup}>
            <p className={styles.accordionTitle}>11. Consolidated Statement of Advances Received/Advance adjusted in the current tax period/ Amendments of information furnished in earlier tax period</p>
            <p className={styles.accordionSubtitle}>Details of nil rated, exempted and non-GST outward supplies made during the tax period</p>
          </div>
        </div>
        <AnimatedExpandable isExpanded={expandedAccordion === 'table11'}>
          <div className={styles.accordionContent}>
            <div className={styles.outwardSectionTitleSub} style={{ color: '#111827', fontWeight: 600 }}>I. Information for the current tax period</div>

            <div className={styles.outwardSectionTitleSub}>11A. Advance amount received in the tax period for which invoice has not been issued (tax amount to be added to output tax liability)</div>

            <div className={styles.outwardSectionTitleSub}>11A (1). Intra-State supplies (Rate Wise)</div>
            <DynamicAgGrid marginBottom="16px" defaultColDef={defaultColDef} rowData={data.table11.section11A1} columnDefs={colDefs11} suppressMenuHide={true} theme="legacy" />

            <div className={styles.outwardSectionTitleSub}>11A (2). Inter-State Supplies (Rate Wise)</div>
            <DynamicAgGrid marginBottom="16px" defaultColDef={defaultColDef} rowData={data.table11.section11A2} columnDefs={colDefs11} suppressMenuHide={true} theme="legacy" />

            <div className={styles.outwardSectionTitleSub}>11B. Advance amount received in earlier tax period and adjusted against the supplies being shown in this tax period in Table Nos. 4, 5, 6 and 7</div>

            <div className={styles.outwardSectionTitleSub}>11B (1). Intra-State Supplies (Rate Wise)</div>
            <DynamicAgGrid marginBottom="16px" defaultColDef={defaultColDef} rowData={data.table11.section11B1} columnDefs={colDefs11} suppressMenuHide={true} theme="legacy" />

            <div className={styles.outwardSectionTitleSub}>11B (2). Inter-State Supplies (Rate Wise)</div>
            <DynamicAgGrid marginBottom="16px" defaultColDef={defaultColDef} rowData={data.table11.section11B2} columnDefs={colDefs11} suppressMenuHide={true} theme="legacy" />

            <div className={styles.outwardSectionTitleSub} style={{ color: '#111827', fontWeight: 600 }}>II Amendment of information furnished in Table No. 11(1) in GSTR-1 statement for earlier tax periods [Furnish revised information]</div>
            <DynamicAgGrid defaultColDef={defaultColDef} rowData={data.table11.amendments} columnDefs={colDefs11Amendments} suppressMenuHide={true} theme="legacy" />
          </div>
        </AnimatedExpandable>
      </div>
    </div>
  );
}
