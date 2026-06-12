import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ColGroupDef } from 'ag-grid-community';
import styles from '../GSTR1Page.module.css';

interface GSTR1AdvancedTabProps {
  data: any;
  expandedAccordion: string | null;
  setExpandedAccordion: (val: string | null) => void;
}

export function GSTR1AdvancedTab({ data, expandedAccordion, setExpandedAccordion }: GSTR1AdvancedTabProps) {

  const colDefs11 = useMemo<(ColDef | ColGroupDef)[]>(() => [
    { field: 'rate', headerName: 'RATE', cellClass: styles.centered, headerClass: styles.centered },
    { field: 'grossAdvance', headerName: 'GROSS ADVANCE RECEIVED/ADJUSTED' },
    { field: 'pos', headerName: 'PLACE OF SUPPLY', cellClass: styles.centered, headerClass: styles.centered },
    {
      headerName: 'AMOUNT',
      children: [
        { field: 'integrated', headerName: 'INTEGRATED', cellClass: styles.centered, headerClass: styles.centered },
        { field: 'central', headerName: 'CENTRAL', cellClass: styles.centered, headerClass: styles.centered },
        { field: 'state', headerName: 'STATE/UT', cellClass: styles.centered, headerClass: styles.centered },
        { field: 'cess', headerName: 'CESS', cellClass: styles.centered, headerClass: styles.centered },
      ]
    }
  ], []);

  const colDefs11Amendments = useMemo<ColDef[]>(() => [
    { field: 'month', headerName: 'Month', cellClass: styles.centered, headerClass: styles.centered },
    { field: 'amendmentRelatingTo', headerName: 'Amendment relating to information furnished in S. No.(select)', flex: 2 },
    { field: 'val11A1', headerName: '11A(1)', cellClass: styles.centered, headerClass: styles.centered },
    { field: 'val11A2', headerName: '11A(2)', cellClass: styles.centered, headerClass: styles.centered },
    { field: 'val11B1', headerName: '11B(1)', cellClass: styles.centered, headerClass: styles.centered },
    { field: 'val11B2', headerName: '11B(2)', cellClass: styles.centered, headerClass: styles.centered },
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
        {expandedAccordion === 'table11' && (
          <div className={styles.accordionContent}>
            <div className={styles.outwardSectionTitleSub} style={{ color: '#111827', fontWeight: 600 }}>I. Information for the current tax period</div>
            
            <div className={styles.outwardSectionTitleSub}>11A. Advance amount received in the tax period for which invoice has not been issued (tax amount to be added to output tax liability)</div>
            
            <div className={styles.outwardSectionTitleSub}>11A (1). Intra-State supplies (Rate Wise)</div>
            <div className="ag-theme-tax-jiffy" style={{ width: '100%', height: '300px', marginBottom: '20px' }}>
              <AgGridReact theme="legacy" rowData={data.table11.section11A1} columnDefs={colDefs11} domLayout="autoHeight" suppressMenuHide={true} />
            </div>

            <div className={styles.outwardSectionTitleSub}>11A (2). Inter-State Supplies (Rate Wise)</div>
            <div className="ag-theme-tax-jiffy" style={{ width: '100%', height: '300px', marginBottom: '20px' }}>
              <AgGridReact theme="legacy" rowData={data.table11.section11A2} columnDefs={colDefs11} domLayout="autoHeight" suppressMenuHide={true} />
            </div>

            <div className={styles.outwardSectionTitleSub}>11B. Advance amount received in earlier tax period and adjusted against the supplies being shown in this tax period in Table Nos. 4, 5, 6 and 7</div>
            
            <div className={styles.outwardSectionTitleSub}>11B (1). Intra-State Supplies (Rate Wise)</div>
            <div className="ag-theme-tax-jiffy" style={{ width: '100%', height: '300px', marginBottom: '20px' }}>
              <AgGridReact theme="legacy" rowData={data.table11.section11B1} columnDefs={colDefs11} domLayout="autoHeight" suppressMenuHide={true} />
            </div>

            <div className={styles.outwardSectionTitleSub}>11B (2). Inter-State Supplies (Rate Wise)</div>
            <div className="ag-theme-tax-jiffy" style={{ width: '100%', height: '300px', marginBottom: '20px' }}>
              <AgGridReact theme="legacy" rowData={data.table11.section11B2} columnDefs={colDefs11} domLayout="autoHeight" suppressMenuHide={true} />
            </div>

            <div className={styles.outwardSectionTitleSub} style={{ color: '#111827', fontWeight: 600 }}>II Amendment of information furnished in Table No. 11(1) in GSTR-1 statement for earlier tax periods [Furnish revised information]</div>
            <div className="ag-theme-tax-jiffy" style={{ width: '100%', height: '300px' }}>
              <AgGridReact theme="legacy" rowData={data.table11.amendments} columnDefs={colDefs11Amendments} domLayout="autoHeight" suppressMenuHide={true} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
