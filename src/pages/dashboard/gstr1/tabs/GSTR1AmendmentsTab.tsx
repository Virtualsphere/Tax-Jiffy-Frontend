import { useMemo, useState } from 'react';
import { AnimatedExpandable } from '@/components/AnimatedExpandable/AnimatedExpandable';
import type { ColDef, ColGroupDef } from 'ag-grid-community';
import styles from '../GSTR1Page.module.css';

interface GSTR1AmendmentsTabProps {
  data: any;
  expandedAccordion: string | null;
  setExpandedAccordion: (val: string | null) => void;
  selectedMonth: string;
  selectedYear: any;
}

import { UnifiedTable } from '@/components/UnifiedTable';

/** Module-level so React never unmounts/remounts it on parent re-renders */
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

  // When no records and a section title is provided, show compact inline badge
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
    <div style={innerStyle} className="compact-grid-wrapper">
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
        hidePagination={true}
        onSearch={setSearchTerm}
        onFilterChange={handleFilterChange}
        filters={[
          { name: 'Status', options: [{label: 'Processed', value: 'processed'}, {label: 'Pending', value: 'pending'}] },
          { name: 'Doc Type', options: [{label: 'Invoice', value: 'inv'}, {label: 'Credit Note', value: 'cn'}] },
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

export function GSTR1AmendmentsTab({ data, expandedAccordion, setExpandedAccordion, selectedMonth, selectedYear }: GSTR1AmendmentsTabProps) {

  const defaultColDef = useMemo<ColDef>(() => ({
    wrapHeaderText: false,
    autoHeaderHeight: false,
    minWidth: 80,
    resizable: true,
    suppressSizeToFit: true,
    suppressHeaderMenuButton: true,
    suppressHeaderFilterButton: true,
  }), []);

  const colDefs9 = useMemo<(ColDef | ColGroupDef)[]>(() => [
    {
      headerName: 'DETAILS OF ORIGINAL DOCUMENT',
      children: [
        { field: 'originalGstin',   headerName: 'GSTIN',     minWidth: 160, cellClass: styles.centered, headerClass: styles.centered },
        { field: 'originalInvNo',   headerName: 'INV. NO.',  minWidth: 100, cellClass: styles.centered, headerClass: styles.centered },
        { field: 'originalInvDate', headerName: 'INV. DATE', minWidth: 105, cellClass: styles.centered, headerClass: styles.centered },
      ]
    },
    {
      headerName: 'REVISED DETAILS / DEBIT NOTE / CREDIT NOTE / REFUND VOUCHER',
      children: [
        { field: 'revisedGstin',   headerName: 'GSTIN',    minWidth: 160, cellClass: styles.centered, headerClass: styles.centered },
        { field: 'revisedInvNo',   headerName: 'INV NO',   minWidth: 100, cellClass: styles.centered, headerClass: styles.centered },
        { field: 'revisedInvDate', headerName: 'INV DATE', minWidth: 105, cellClass: styles.centered, headerClass: styles.centered },
        { field: 'sbNo',           headerName: 'SB NO.',   minWidth: 95,  cellClass: styles.centered, headerClass: styles.centered },
        { field: 'sbDate',         headerName: 'SB DATE',  minWidth: 100, cellClass: styles.centered, headerClass: styles.centered },
      ]
    },
    { field: 'value',         headerName: 'VALUE',         minWidth: 100, cellClass: styles.centered, headerClass: styles.centered },
    { field: 'rate',          headerName: 'RATE (%)',       minWidth: 100, cellClass: styles.centered, headerClass: styles.centered },
    { field: 'taxableValue',  headerName: 'TAXABLE VALUE',  minWidth: 130, cellClass: styles.centered, headerClass: styles.centered },
    { field: 'integratedTax', headerName: 'IGST',           minWidth: 95,  cellClass: styles.centered, headerClass: styles.centered },
  ], []);

  // colDefs10: use minWidth (not width) so autoSizeStrategy won't shrink below readable size
  const colDefs10 = useMemo<(ColDef | ColGroupDef)[]>(() => [
    { field: 'rate',         headerName: 'RATE (%)',            minWidth: 75,  maxWidth: 110, cellClass: styles.centered, headerClass: styles.centered },
    { field: 'taxableValue', headerName: 'TOTAL TAXABLE VALUE', minWidth: 110, maxWidth: 155, cellClass: styles.centered, headerClass: styles.centered },
    {
      headerName: 'AMOUNT',
      children: [
        { field: 'integrated', headerName: 'INTEGRATED', minWidth: 85,  maxWidth: 130, cellClass: styles.centered, headerClass: styles.centered },
        { field: 'central',    headerName: 'CENTRAL',    minWidth: 70,  maxWidth: 120, cellClass: styles.centered, headerClass: styles.centered },
        { field: 'state',      headerName: 'STATE/UT',   minWidth: 70,  maxWidth: 120, cellClass: styles.centered, headerClass: styles.centered },
      ]
    }
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
      {/* Table 9 */}
      <div className={styles.accordion}>
        <div className={styles.accordionHeader} onClick={() => setExpandedAccordion(expandedAccordion === 'table9' ? null : 'table9')} role="button" tabIndex={0}>
          <AccordionIcon expanded={expandedAccordion === 'table9'} />
          <div className={styles.accordionTitleGroup}>
            <p className={styles.accordionTitle}>Table 9: Amendments to outward supplies</p>
            <p className={styles.accordionSubtitle}>Amendments to taxable outward supply details furnished in returns for earlier tax periods in Table 4, 5 and 6</p>
          </div>
        </div>
        <AnimatedExpandable isExpanded={expandedAccordion === 'table9'}>
          <div className={styles.accordionContent}>
            <DynamicAgGrid marginBottom="20px" defaultColDef={defaultColDef} rowData={data.table9.section9A} columnDefs={colDefs9} suppressMenuHide={true} theme="legacy"
              sectionTitle="9A. If the invoice/Shipping bill details furnished earlier were incorrect"
              sectionTitleStyle={{ color: '#5a6acf' }}
            />

            <DynamicAgGrid marginBottom="20px" defaultColDef={defaultColDef} rowData={data.table9.section9B} columnDefs={colDefs9} suppressMenuHide={true} theme="legacy"
              sectionTitle="9B. Debit Notes/Credit Notes/Refund voucher [original]"
              sectionTitleStyle={{ color: '#5a6acf' }}
            />

            <DynamicAgGrid defaultColDef={defaultColDef} rowData={data.table9.section9C} columnDefs={colDefs9} suppressMenuHide={true} theme="legacy"
              sectionTitle="9C. Debit Notes/Credit Notes/Refund voucher [amendments thereof]"
              sectionTitleStyle={{ color: '#5a6acf' }}
            />
          </div>
        </AnimatedExpandable>
      </div>

      {/* Table 10 */}
      <div className={styles.accordion}>
        <div className={styles.accordionHeader} onClick={() => setExpandedAccordion(expandedAccordion === 'table10' ? null : 'table10')} role="button" tabIndex={0}>
          <AccordionIcon expanded={expandedAccordion === 'table10'} />
          <div className={styles.accordionTitleGroup}>
            <p className={styles.accordionTitle}>Table 10: Amendments to outward supplies (to unregistered persons)</p>
            <p className={styles.accordionSubtitle}>Amendments to taxable outward supplies to unregistered persons furnished in returns for earlier tax periods in Table 7</p>
          </div>
        </div>
        <AnimatedExpandable isExpanded={expandedAccordion === 'table10'}>
          <div className={styles.accordionContent}>
            <div className={styles.outwardSectionTitleSub}>Tax period for which the details are being revised: {selectedMonth} {selectedYear.startYear}</div>

            <DynamicAgGrid marginBottom="20px" defaultColDef={defaultColDef} rowData={data.table10.section10A} columnDefs={colDefs10} suppressMenuHide={true} theme="legacy"
              sectionTitle="10A. Intra-State Supplies [Rate wise]"
              sectionTitleStyle={{ color: '#5a6acf' }}
            />

            <DynamicAgGrid marginBottom="20px" defaultColDef={defaultColDef} rowData={data.table10.section10A1} columnDefs={colDefs10} suppressMenuHide={true} theme="legacy"
              sectionTitle="10A (1). Supplies through e-Commerce Operators attracting TCS (operator wise, rate wise)"
              sectionTitleStyle={{ color: '#5a6acf' }}
              sectionExtra={<div className={styles.outwardEcommerceGSTIN}>GSTIN of e-commerce operator: {data.table10.section10A1_ecommerceGstin}</div>}
            />

            <DynamicAgGrid marginBottom="20px" defaultColDef={defaultColDef} rowData={data.table10.section10B} columnDefs={colDefs10} suppressMenuHide={true} theme="legacy"
              sectionTitle="10B. Inter-State Supplies [Rate wise]"
              sectionTitleStyle={{ color: '#5a6acf' }}
              sectionSubtitle={<>Place of Supply (Name of State): {data.table10.section10B_pos}</>}
            />

            <DynamicAgGrid defaultColDef={defaultColDef} rowData={data.table10.section10B1} columnDefs={colDefs10} suppressMenuHide={true} theme="legacy"
              sectionTitle="10B (1). Supplies through e-Commerce Operators attracting TCS (operator wise, rate wise)"
              sectionTitleStyle={{ color: '#5a6acf' }}
              sectionExtra={<div className={styles.outwardEcommerceGSTIN}>GSTIN of e-commerce operator: {data.table10.section10B1_ecommerceGstin}</div>}
            />
          </div>
        </AnimatedExpandable>
      </div>
    </div>
  );
}
