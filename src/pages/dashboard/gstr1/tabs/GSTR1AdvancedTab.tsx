import { useMemo, useState } from 'react';
import { AnimatedExpandable } from '@/components/AnimatedExpandable/AnimatedExpandable';
import type { ColDef, ColGroupDef } from 'ag-grid-community';
import styles from '../GSTR1Page.module.css';

interface GSTR1AdvancedTabProps {
  data: any;
  expandedAccordion: string | null;
  setExpandedAccordion: (val: string | null) => void;
}

import { UnifiedTable } from '@/components/UnifiedTable';

/** Sizes to content; only scrolls for large datasets */
const DynamicAgGrid = (props: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const innerStyle = { width: '100%', maxWidth: '100%', height: 'auto', marginBottom: props.marginBottom || '0' };
  
  const filteredData = useMemo(() => {
    let data = props.rowData || [];
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      data = data.filter((row: any) => 
        Object.values(row).some(val => 
          String(val).toLowerCase().includes(lowerSearch)
        )
      );
    }
    Object.values(activeFilters).forEach(filterValue => {
      if (filterValue) {
        const lowerFilter = filterValue.toLowerCase();
        data = data.filter((row: any) => 
          Object.values(row).some(val => 
            String(val).toLowerCase().includes(lowerFilter)
          )
        );
      }
    });
    return data;
  }, [props.rowData, searchTerm, activeFilters]);

  const handleFilterChange = (filterName: string, value: string) => {
    setActiveFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const hasNoRecords = !props.rowData || props.rowData.length === 0;
  const { sectionTitle, sectionSubtitle, sectionExtra, sectionTitleStyle } = props;

  if (hasNoRecords && sectionTitle) {
    return (
      <div style={innerStyle}>
        {sectionExtra}
        <div className={styles.sectionTitleRow}>
          <div className={styles.outwardSectionTitle} style={sectionTitleStyle}>{sectionTitle}</div>
          <span className={styles.noRecordsBadge}>
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            No Records
          </span>
          {sectionSubtitle && (
            <div className={styles.outwardSectionTitleSub}>{sectionSubtitle}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={innerStyle}>
      {sectionExtra}
      {sectionTitle && (
        <>
          <div className={styles.outwardSectionTitle} style={sectionTitleStyle}>{sectionTitle}</div>
          {sectionSubtitle && <div className={styles.outwardSectionTitleSub}>{sectionSubtitle}</div>}
        </>
      )}
      <UnifiedTable
        variant="nested"
        hideHeader={true}
        onSearch={setSearchTerm}
        onFilterChange={handleFilterChange}
        filters={[
          { name: 'State', options: [{label: 'Delhi', value: 'delhi'}, {label: 'Maharashtra', value: 'mh'}] },
          { name: 'Date Range', options: [{label: 'Last 7 Days', value: '7d'}, {label: 'Last 30 Days', value: '30d'}] },
          ]}
          title=""
          recordCount={filteredData.length}
          rowData={filteredData}
          columnDefs={props.columnDefs}
          pinnedBottomRowData={props.pinnedBottomRowData}
          showFilterBarInFullscreenOnly={true}
        />
      </div>
  );
};

export function GSTR1AdvancedTab({ data, expandedAccordion, setExpandedAccordion }: GSTR1AdvancedTabProps) {

  const defaultColDef = useMemo<ColDef>(() => ({
    minWidth: 80,
    resizable: true,
    suppressSizeToFit: true,
  }), []);

  const colDefs11 = useMemo<(ColDef | ColGroupDef)[]>(() => [
    { field: 'rate',         headerName: 'RATE',                           minWidth: 80,  cellClass: styles.centered, headerClass: styles.centered },
    { field: 'grossAdvance', headerName: 'GROSS ADVANCE RECEIVED/ADJUSTED', minWidth: 160 },
    { field: 'pos',          headerName: 'PLACE OF SUPPLY',                 minWidth: 130, cellClass: styles.centered, headerClass: styles.centered },
    {
      headerName: 'AMOUNT',
      children: [
        { field: 'integrated', headerName: 'IGST',    minWidth: 90, cellClass: styles.centered, headerClass: styles.centered },
        { field: 'central',    headerName: 'CGST',    minWidth: 90, cellClass: styles.centered, headerClass: styles.centered },
        { field: 'state',      headerName: 'SGST/UT', minWidth: 90, cellClass: styles.centered, headerClass: styles.centered },
        { field: 'cess',       headerName: 'CESS',    minWidth: 80, cellClass: styles.centered, headerClass: styles.centered },
      ]
    }
  ], []);

  const colDefs11Amendments = useMemo<ColDef[]>(() => [
    { field: 'month',              headerName: 'Month',         minWidth: 90, cellClass: styles.centered, headerClass: styles.centered },
    { field: 'amendmentRelatingTo', headerName: 'Amendment Relating To (S. No.)', minWidth: 200 },
    { field: 'val11A1', headerName: '11A(1)', minWidth: 80, cellClass: styles.centered, headerClass: styles.centered },
    { field: 'val11A2', headerName: '11A(2)', minWidth: 80, cellClass: styles.centered, headerClass: styles.centered },
    { field: 'val11B1', headerName: '11B(1)', minWidth: 80, cellClass: styles.centered, headerClass: styles.centered },
    { field: 'val11B2', headerName: '11B(2)', minWidth: 80, cellClass: styles.centered, headerClass: styles.centered },
  ], []);

  const AccordionIcon = ({ expanded }: { expanded: boolean }) => (
    <div className={`${styles.accordionIcon} ${expanded ? styles.accordionIconExpanded : ''}`}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className={styles.outwardTabContent}>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
          No data available for advanced details in this draft.
        </div>
      </div>
    );
  }

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

            <DynamicAgGrid marginBottom="16px" defaultColDef={defaultColDef} rowData={data.table11.section11A1} columnDefs={colDefs11} suppressMenuHide={true} theme="legacy"
              sectionTitle="11A (1). Intra-State supplies (Rate Wise)"
            />

            <DynamicAgGrid marginBottom="16px" defaultColDef={defaultColDef} rowData={data.table11.section11A2} columnDefs={colDefs11} suppressMenuHide={true} theme="legacy"
              sectionTitle="11A (2). Inter-State Supplies (Rate Wise)"
            />

            <div className={styles.outwardSectionTitleSub}>11B. Advance amount received in earlier tax period and adjusted against the supplies being shown in this tax period in Table Nos. 4, 5, 6 and 7</div>

            <DynamicAgGrid marginBottom="16px" defaultColDef={defaultColDef} rowData={data.table11.section11B1} columnDefs={colDefs11} suppressMenuHide={true} theme="legacy"
              sectionTitle="11B (1). Intra-State Supplies (Rate Wise)"
            />

            <DynamicAgGrid marginBottom="16px" defaultColDef={defaultColDef} rowData={data.table11.section11B2} columnDefs={colDefs11} suppressMenuHide={true} theme="legacy"
              sectionTitle="11B (2). Inter-State Supplies (Rate Wise)"
            />

            <DynamicAgGrid defaultColDef={defaultColDef} rowData={data.table11.amendments} columnDefs={colDefs11Amendments} suppressMenuHide={true} theme="legacy"
              sectionTitle="II Amendment of information furnished in Table No. 11(1) in GSTR-1 statement for earlier tax periods [Furnish revised information]"
              sectionTitleStyle={{ color: '#111827', fontWeight: 600 }}
            />
          </div>
        </AnimatedExpandable>
      </div>
    </div>
  );
}
