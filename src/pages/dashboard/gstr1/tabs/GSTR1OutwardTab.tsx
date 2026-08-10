import { useMemo, useState } from 'react';
import { AnimatedExpandable } from '@/components/AnimatedExpandable/AnimatedExpandable';
import type { ColDef } from 'ag-grid-community';
import styles from '../GSTR1Page.module.css';

interface GSTR1OutwardTabProps {
  data: any;
  expandedAccordion: string | null;
  setExpandedAccordion: (val: string | null) => void;
}

import { UnifiedTable } from '@/components/UnifiedTable';

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


export function GSTR1OutwardTab({ data, expandedAccordion, setExpandedAccordion }: GSTR1OutwardTabProps) {
  const defaultColDef = useMemo<ColDef>(() => ({
    minWidth: 80,
    resizable: true,
    suppressSizeToFit: true,
  }), []);

  /* ── Narrow numeric widths shared across tables ── */
  const TAX_COL = { minWidth: 90, cellClass: styles.centered, headerClass: styles.centered };
  const VAL_COL = { minWidth: 110 };

  /* ─── Table 4 cols ─── */
  const colDefs4 = useMemo<ColDef[]>(() => [
    { field: 'gstin',        headerName: 'GSTIN/UIN',         minWidth: 160,
      colSpan: (p: any) => p.node?.rowPinned === 'bottom' ? 3 : 1,
      cellStyle: (p: any) => p.node?.rowPinned === 'bottom' ? { color: '#5A6ACF', whiteSpace: 'nowrap' } as any : { whiteSpace: 'nowrap' } as any },
    { field: 'invoiceNo',    headerName: 'INVOICE NO',         minWidth: 110 },
    { field: 'invoiceDate',  headerName: 'INVOICE DATE',       minWidth: 100, ...{ cellClass: styles.centered, headerClass: styles.centered } },
    { field: 'invoiceValue', headerName: 'INVOICE VALUE (₹)', ...VAL_COL },
    { field: 'taxableValue', headerName: 'TAXABLE VALUE (₹)', ...VAL_COL },
    { field: 'igst',  headerName: 'IGST (₹)',      ...TAX_COL, cellClass: (p: any) => p.value !== '0.00' ? styles.textBlue : styles.centered },
    { field: 'cgst',  headerName: 'CGST (₹)',      ...TAX_COL, cellClass: (p: any) => p.value !== '0.00' ? styles.textBlue : styles.centered },
    { field: 'sgst',  headerName: 'SGST/UTGST (₹)',...TAX_COL, cellClass: (p: any) => p.value !== '0.00' ? styles.textBlue : styles.centered },
    { field: 'cess',  headerName: 'CESS (₹)',       ...TAX_COL },
    { field: 'pos',   headerName: 'PLACE OF SUPPLY', minWidth: 130 },
  ], []);

  /* ─── Table 5A cols ─── */
  const colDefs5 = useMemo<ColDef[]>(() => [
    { field: 'gstin',        headerName: 'GSTIN/UIN',          minWidth: 160, hide: true },
    { field: 'pos',          headerName: 'PLACE OF SUPPLY',    minWidth: 130 },
    { field: 'invoiceNo',    headerName: 'INVOICE NO',          minWidth: 100, cellClass: styles.centered, headerClass: styles.centered },
    { field: 'invoiceDate',  headerName: 'INVOICE DATE',        minWidth: 100, cellClass: styles.centered, headerClass: styles.centered },
    { field: 'invoiceValue', headerName: 'INVOICE VALUE (₹)',  ...VAL_COL },
    { field: 'rate',         headerName: 'RATE (%)',            ...TAX_COL },
    { field: 'taxableValue', headerName: 'TAXABLE VALUE (₹)',  ...VAL_COL },
    { field: 'igst',         headerName: 'IGST (₹)',            ...TAX_COL, cellClass: styles.textBlue },
  ], []);

  /* ─── Table 5B cols ─── */
  const colDefs5B = useMemo<ColDef[]>(() => [
    { field: 'pos',          headerName: 'PLACE OF SUPPLY',    minWidth: 130,
      colSpan: (p: any) => p.node?.rowPinned === 'bottom' ? 3 : 1,
      cellStyle: (p: any) => p.node?.rowPinned === 'bottom' ? { color: '#5A6ACF', whiteSpace: 'nowrap' } : undefined },
    { field: 'invoiceNo',    headerName: 'INVOICE NO',          minWidth: 100, cellClass: styles.centered, headerClass: styles.centered },
    { field: 'invoiceDate',  headerName: 'INVOICE DATE',        minWidth: 100, cellClass: styles.centered, headerClass: styles.centered },
    { field: 'invoiceValue', headerName: 'INVOICE VALUE (₹)',  ...VAL_COL },
    { field: 'rate',         headerName: 'RATE (%)',            ...TAX_COL },
    { field: 'taxableValue', headerName: 'TAXABLE VALUE (₹)',  ...VAL_COL },
    { field: 'igst',         headerName: 'IGST (₹)',            ...TAX_COL, cellClass: styles.textBlue },
  ], []);

  /* ─── Table 6 cols (grouped) ─── */
  const colDefs6 = useMemo<any[]>(() => [
    { field: 'gstin', headerName: 'GSTIN OF RECIPIENT', minWidth: 160 },
    {
      headerName: 'INVOICE DETAILS',
      children: [
        { field: 'invoiceNo',    headerName: 'NO.',    minWidth: 100, cellClass: styles.centered, headerClass: styles.centered },
        { field: 'invoiceDate',  headerName: 'DATE',   minWidth: 90,  cellClass: styles.centered, headerClass: styles.centered },
        { field: 'invoiceValue', headerName: 'VALUE',  minWidth: 100 },
      ]
    },
    {
      headerName: 'SHIPPING BILL / BILL OF EXPORT',
      children: [
        { field: 'sbNo',   headerName: 'NO.',  minWidth: 90, cellClass: styles.centered, headerClass: styles.centered },
        { field: 'sbDate', headerName: 'DATE', minWidth: 90, cellClass: styles.centered, headerClass: styles.centered },
      ]
    },
    {
      headerName: 'INTEGRATED TAX',
      children: [
        { field: 'rate',         headerName: 'RATE (%)',      width: 80, cellClass: styles.centered, headerClass: styles.centered },
        { field: 'taxableValue', headerName: 'TAXABLE VALUE', minWidth: 110 },
        { field: 'amt',          headerName: 'AMT.',          width: 90, cellClass: styles.textBlue },
      ]
    }
  ], []);

  /* ─── Table 7 cols (grouped) ─── */
  const colDefs7 = useMemo<any[]>(() => [
    { field: 'rate',      headerName: 'RATE OF TAX',           width: 90,  cellClass: styles.centered, headerClass: styles.centered },
    { field: 'stateName', headerName: 'PLACE OF SUPPLY',       minWidth: 130, hide: true },
    { field: 'taxableValue', headerName: 'TOTAL TAXABLE VALUE (₹)', minWidth: 130, cellClass: styles.centered, headerClass: styles.centered },
    {
      headerName: 'AMOUNT (₹)',
      children: [
        { field: 'integrated', headerName: 'INTEGRATED', width: 100, cellClass: styles.centered, headerClass: styles.centered },
        { field: 'central',    headerName: 'CENTRAL',    width: 90,  cellClass: styles.centered, headerClass: styles.centered },
        { field: 'state',      headerName: 'STATE/UT',   width: 90,  cellClass: styles.centered, headerClass: styles.centered },
      ]
    }
  ], []);

  /* ─── Table 8 cols ─── */
  const colDefs8 = useMemo<ColDef[]>(() => [
    { field: 'label',     headerName: 'DESCRIPTION',                                          minWidth: 220, cellStyle: { textAlign: 'left' }, headerClass: styles.centered },
    { field: 'nilRated',  headerName: 'NIL RATED SUPPLIES (₹)',                               minWidth: 120, cellClass: styles.centered, headerClass: styles.centered },
    { field: 'exempted',  headerName: 'EXEMPTED (OTHER THAN NIL RATED/NON-GST SUPPLY) (₹)',  minWidth: 200, cellClass: styles.centered, headerClass: styles.centered },
    { field: 'nonGst',    headerName: 'NON-GST SUPPLIES (₹)',                                 minWidth: 130, cellClass: styles.centered, headerClass: styles.centered },
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
          No data available for outward supplies in this draft.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.outwardTabContent}>
      {/* Table 4 */}
      <div className={styles.accordion}>
        <div className={styles.accordionHeader} onClick={() => setExpandedAccordion(expandedAccordion === 'table4' ? null : 'table4')} role="button" tabIndex={0}>
          <AccordionIcon expanded={expandedAccordion === 'table4'} />
          <div className={styles.accordionTitleGroup}>
            <p className={styles.accordionTitle}>Table 4: Taxable outward supplies made to registered persons (including UIN-holders)</p>
            <p className={styles.accordionSubtitle}>B2B supplies, Reverse Charge and E-commerce supplies</p>
          </div>
        </div>
        <AnimatedExpandable isExpanded={expandedAccordion === 'table4'}>
          <div className={styles.accordionContent}>
            <DynamicAgGrid marginBottom="20px" theme="legacy" defaultColDef={defaultColDef} rowData={data.table4.section4A} columnDefs={colDefs4} suppressMenuHide={true}
              sectionTitle="4A. SUPPLIES OTHER THAN REVERSE CHARGE & E-COMMERCE"
            />

            <DynamicAgGrid marginBottom="20px" theme="legacy" defaultColDef={defaultColDef} rowData={data.table4.section4B} columnDefs={colDefs4} suppressMenuHide={true}
              sectionTitle="4B. SUPPLIES ATTRACTING REVERSE CHARGE"
            />

            <DynamicAgGrid theme="legacy"
              defaultColDef={defaultColDef}
              rowData={data.table4.section4C}
              columnDefs={colDefs4}
              suppressMenuHide={true}
              sectionTitle="4C. SUPPLIES THROUGH E-COMMERCE (TCS)"
              sectionExtra={<div className={styles.outwardEcommerceGSTIN}>E-COMMERCE OPERATOR GSTIN: {data.table4.section4C_ecommerceGstin}</div>}
              pinnedBottomRowData={[{
                gstin: 'TOTAL SUMMARIZED RECORDS FOR TABLE 4',
                invoiceValue: data.table4.total.invoiceValue,
                taxableValue: data.table4.total.taxableValue,
                igst: data.table4.total.igst,
                cgst: data.table4.total.cgst,
                sgst: data.table4.total.sgst,
                cess: data.table4.total.cess
              }]}
            />
          </div>
        </AnimatedExpandable>
      </div>

      {/* Table 5 */}
      <div className={styles.accordion}>
        <div className={styles.accordionHeader} onClick={() => setExpandedAccordion(expandedAccordion === 'table5' ? null : 'table5')} role="button" tabIndex={0}>
          <AccordionIcon expanded={expandedAccordion === 'table5'} />
          <div className={styles.accordionTitleGroup}>
            <p className={styles.accordionTitle}>Table 5: Taxable outward inter-State supplies to un-registered persons where the invoice value is more than Rs 2.5 lakh</p>
            <p className={styles.accordionSubtitle}>Taxable inter-State supplies to un-registered persons {'>'} 2.5 lakh</p>
          </div>
        </div>
        <AnimatedExpandable isExpanded={expandedAccordion === 'table5'}>
          <div className={styles.accordionContent}>
            <DynamicAgGrid marginBottom="20px" theme="legacy" defaultColDef={defaultColDef} rowData={data.table5.section5A} columnDefs={colDefs5.filter((c: any) => !c.hide)} suppressMenuHide={true}
              sectionTitle="5A. OUTWARD SUPPLIES (OTHER THAN E-COMMERCE OPERATOR, RATE-WISE)"
              sectionSubtitle="Inter-state supplies to unregistered persons (aggregated by rate)"
            />

            <DynamicAgGrid theme="legacy"
              defaultColDef={defaultColDef}
              rowData={data.table5.section5B}
              columnDefs={colDefs5B}
              suppressMenuHide={true}
              sectionTitle="5B. SUPPLIES MADE THROUGH E-COMMERCE OPERATOR (TCS APPLICABLE, RATE-WISE)"
              sectionExtra={<div className={styles.outwardEcommerceGSTIN}>GSTIN OF E-COMMERCE OPERATOR <span style={{ background: '#f1f3f9', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px' }}>{data.table5.section5B_ecommerceGstin}</span></div>}
              pinnedBottomRowData={[{
                pos: 'TOTAL SUMMARIZED RECORDS FOR TABLE 5',
                invoiceValue: data.table5.total.invoiceValue,
                taxableValue: data.table5.total.taxableValue,
                igst: data.table5.total.igst,
              }]}
            />
          </div>
        </AnimatedExpandable>
      </div>

      {/* Table 6 */}
      <div className={styles.accordion}>
        <div className={styles.accordionHeader} onClick={() => setExpandedAccordion(expandedAccordion === 'table6' ? null : 'table6')} role="button" tabIndex={0}>
          <AccordionIcon expanded={expandedAccordion === 'table6'} />
          <div className={styles.accordionTitleGroup}>
            <p className={styles.accordionTitle}>Table 6: Zero rated supplies and Deemed Exports</p>
            <p className={styles.accordionSubtitle}>Exports, SEZ supplies, Deemed exports</p>
          </div>
        </div>
        <AnimatedExpandable isExpanded={expandedAccordion === 'table6'}>
          <div className={styles.accordionContent}>
            <DynamicAgGrid marginBottom="20px" theme="legacy" defaultColDef={defaultColDef} rowData={data.table6.section6A} columnDefs={colDefs6} suppressMenuHide={true}
              sectionTitle="6A. EXPORTS"
            />

            <DynamicAgGrid marginBottom="20px" theme="legacy" defaultColDef={defaultColDef} rowData={data.table6.section6B} columnDefs={colDefs6} suppressMenuHide={true}
              sectionTitle="6B. SUPPLIES MADE TO SEZ UNIT / SEZ DEVELOPER"
            />

            <DynamicAgGrid theme="legacy" defaultColDef={defaultColDef} rowData={data.table6.section6C} columnDefs={colDefs6} suppressMenuHide={true}
              sectionTitle="6C. DEEMED EXPORTS"
            />
          </div>
        </AnimatedExpandable>
      </div>

      {/* Table 7 */}
      <div className={styles.accordion}>
        <div className={styles.accordionHeader} onClick={() => setExpandedAccordion(expandedAccordion === 'table7' ? null : 'table7')} role="button" tabIndex={0}>
          <AccordionIcon expanded={expandedAccordion === 'table7'} />
          <div className={styles.accordionTitleGroup}>
            <p className={styles.accordionTitle}>7. Taxable supplies (Net of debit notes and credit notes) to unregistered persons other than the supplies covered in Table 5</p>
          </div>
        </div>
        {expandedAccordion === 'table7' && (
          <div className={styles.accordionContent}>
            <DynamicAgGrid marginBottom="20px" theme="legacy" defaultColDef={defaultColDef} rowData={data.table7.section7A1} columnDefs={colDefs7} suppressMenuHide={true}
              sectionTitle="7A. Intra-State supplies"
              sectionSubtitle="7A (1). Consolidated rate wise outward supplies [including supplies made through e-commerce operator attracting TCS]"
            />

            <DynamicAgGrid marginBottom="20px" theme="legacy" defaultColDef={defaultColDef} rowData={data.table7.section7A2} columnDefs={colDefs7} suppressMenuHide={true}
              sectionTitle="7A (2). Out of supplies mentioned at 7A(1), value of supplies made through e-Commerce Operators attracting TCS (operator wise, rate wise)"
              sectionExtra={<div className={styles.outwardEcommerceGSTIN}>GSTIN of e-commerce operator: {data.table7.section7A2_ecommerceGstin}</div>}
            />

            <DynamicAgGrid marginBottom="20px" theme="legacy" defaultColDef={defaultColDef} rowData={data.table7.section7B1} columnDefs={[...colDefs7, { field: 'stateName', headerName: 'PLACE OF SUPPLY', minWidth: 130 }]} suppressMenuHide={true}
              sectionTitle="7B. Inter-State Supplies where invoice value is upto Rs 2.5 Lakh [Rate wise]"
              sectionSubtitle={<>7B (1). Place of Supply (Name of State): {data.table7.section7B1_pos}</>}
            />

            <DynamicAgGrid theme="legacy" defaultColDef={defaultColDef} rowData={data.table7.section7B2} columnDefs={colDefs7} suppressMenuHide={true}
              sectionTitle="7B (2). Out of the supplies mentioned in 7B (1), the supplies made through e-Commerce Operators (operator wise, rate wise)"
              sectionExtra={<div className={styles.outwardEcommerceGSTIN}>GSTIN of e-commerce operator: {data.table7.section7B2_ecommerceGstin}</div>}
            />
          </div>
        )}
      </div>

      {/* Table 8 */}
      <div className={styles.accordion}>
        <div className={styles.accordionHeader} onClick={() => setExpandedAccordion(expandedAccordion === 'table8' ? null : 'table8')} role="button" tabIndex={0}>
          <AccordionIcon expanded={expandedAccordion === 'table8'} />
          <div className={styles.accordionTitleGroup}>
            <p className={styles.accordionTitle}>Table 8: Nil rated, exempted and non GST outward supplies</p>
            <p className={styles.accordionSubtitle}>Summary of non-taxable supplies</p>
          </div>
        </div>
        {expandedAccordion === 'table8' && (
          <div className={styles.accordionContent}>
            <DynamicAgGrid theme="legacy"
              defaultColDef={defaultColDef}
              rowData={[data.table8.section8A, data.table8.section8B, data.table8.section8C, data.table8.section8D]}
              columnDefs={colDefs8}
              suppressMenuHide={true}
              pinnedBottomRowData={[{
                label: data.table8.total.label,
                nilRated: data.table8.total.nilRated,
                exempted: data.table8.total.exempted,
                nonGst: data.table8.total.nonGst
              }]}
            />
          </div>
        )}
      </div>

    </div>
  );
}
