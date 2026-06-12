import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import styles from '../GSTR1Page.module.css';

interface GSTR1OutwardTabProps {
  data: any;
  expandedAccordion: string | null;
  setExpandedAccordion: (val: string | null) => void;
}

export function GSTR1OutwardTab({ data, expandedAccordion, setExpandedAccordion }: GSTR1OutwardTabProps) {
  const defaultColDef = useMemo<ColDef>(() => ({
    wrapHeaderText: true,
    autoHeaderHeight: true,
    minWidth: 100,
    resizable: true,
  }), []);

  const colDefs4 = useMemo<ColDef[]>(() => [
    { field: 'gstin', headerName: 'GSTIN/UIN', colSpan: (p: any) => p.node?.rowPinned === 'bottom' ? 3 : 1, cellStyle: (p: any) => p.node?.rowPinned === 'bottom' ? { color: '#5A6ACF' } : null },
    { field: 'invoiceNo', headerName: 'INVOICE NO' },
    { field: 'invoiceDate', headerName: 'INVOICE DATE' },
    { field: 'invoiceValue', headerName: 'INVOICE VALUE (₹)' },
    { field: 'taxableValue', headerName: 'TAXABLE VALUE (₹)' },
    { field: 'igst', headerName: 'IGST (₹)', cellClass: (p: any) => p.value !== '0.00' ? styles.textBlue : '' },
    { field: 'cgst', headerName: 'CGST (₹)', cellClass: (p: any) => p.value !== '0.00' ? styles.textBlue : '' },
    { field: 'sgst', headerName: 'SGST/UTGST (₹)', cellClass: (p: any) => p.value !== '0.00' ? styles.textBlue : '' },
    { field: 'cess', headerName: 'CESS (₹)' },
    { field: 'pos', headerName: 'PLACE OF SUPPLY' }
  ], []);

  const colDefs5 = useMemo<ColDef[]>(() => [
    { field: 'gstin', headerName: 'GSTIN/UIN', hide: true }, // Used in 5B but hidden in 5A
    { field: 'pos', headerName: 'PLACE OF SUPPLY' },
    { field: 'invoiceNo', headerName: 'INVOICE NO', cellClass: styles.centered, headerClass: styles.centered },
    { field: 'invoiceDate', headerName: 'INVOICE DATE', cellClass: styles.centered, headerClass: styles.centered },
    { field: 'invoiceValue', headerName: 'INVOICE VALUE (₹)' },
    { field: 'rate', headerName: 'RATE (%)', cellClass: styles.centered, headerClass: styles.centered },
    { field: 'taxableValue', headerName: 'TAXABLE VALUE (₹)' },
    { field: 'igst', headerName: 'IGST (₹)', cellClass: styles.textBlue },
  ], []);

  const colDefs5B = useMemo<ColDef[]>(() => [
    { field: 'gstin', headerName: 'GSTIN/UIN', colSpan: (p: any) => p.node?.rowPinned === 'bottom' ? 4 : 1, cellStyle: (p: any) => p.node?.rowPinned === 'bottom' ? { color: '#5A6ACF' } : null },
    { field: 'pos', headerName: 'PLACE OF SUPPLY' },
    { field: 'invoiceNo', headerName: 'INVOICE NO', cellClass: styles.centered, headerClass: styles.centered },
    { field: 'invoiceDate', headerName: 'INVOICE DATE', cellClass: styles.centered, headerClass: styles.centered },
    { field: 'invoiceValue', headerName: 'INVOICE VALUE (₹)' },
    { field: 'rate', headerName: 'RATE (%)', cellClass: styles.centered, headerClass: styles.centered },
    { field: 'taxableValue', headerName: 'TAXABLE VALUE (₹)' },
    { field: 'igst', headerName: 'IGST (₹)', cellClass: styles.textBlue },
  ], []);

  const colDefs6 = useMemo<any[]>(() => [
    { field: 'gstin', headerName: 'GSTIN OF RECIPIENT' },
    {
      headerName: 'INVOICE DETAILS',
      children: [
        { field: 'invoiceNo', headerName: 'NO.', cellClass: styles.centered, headerClass: styles.centered },
        { field: 'invoiceDate', headerName: 'DATE', cellClass: styles.centered, headerClass: styles.centered },
        { field: 'invoiceValue', headerName: 'VALUE' },
      ]
    },
    {
      headerName: 'SHIPPING BILL/ BILL OF EXPORT',
      children: [
        { field: 'sbNo', headerName: 'NO.', cellClass: styles.centered, headerClass: styles.centered },
        { field: 'sbDate', headerName: 'DATE', cellClass: styles.centered, headerClass: styles.centered },
      ]
    },
    {
      headerName: 'INTEGRATED TAX',
      children: [
        { field: 'rate', headerName: 'RATE', cellClass: styles.centered, headerClass: styles.centered },
        { field: 'taxableValue', headerName: 'TAXABLE VALUE' },
        { field: 'amt', headerName: 'AMT.', cellClass: styles.textBlue },
      ]
    }
  ], []);

  const colDefs7 = useMemo<any[]>(() => [
    { field: 'rate', headerName: 'RATE OF TAX', cellClass: styles.centered, headerClass: styles.centered },
    { field: 'stateName', headerName: 'PLACE OF SUPPLY', hide: true }, // Show dynamically if needed
    { field: 'taxableValue', headerName: 'TOTAL TAXABLE VALUE (₹)', cellClass: styles.centered, headerClass: styles.centered },
    {
      headerName: 'AMOUNT (₹)',
      children: [
        { field: 'integrated', headerName: 'INTEGRATED', cellClass: styles.centered, headerClass: styles.centered },
        { field: 'central', headerName: 'CENTRAL', cellClass: styles.centered, headerClass: styles.centered },
        { field: 'state', headerName: 'STATE TAX/UT TAX', cellClass: styles.centered, headerClass: styles.centered },
      ]
    }
  ], []);

  const colDefs8 = useMemo<ColDef[]>(() => [
    { field: 'label', headerName: 'DESCRIPTION', flex: 2, cellStyle: { textAlign: 'left' }, headerClass: styles.centered },
    { field: 'nilRated', headerName: 'NIL RATED SUPPLIES (₹)', cellClass: styles.centered, headerClass: styles.centered, flex: 1 },
    { field: 'exempted', headerName: 'EXEMPTED (OTHER THAN NIL RATED/NON-GST SUPPLY) (₹)', cellClass: styles.centered, headerClass: styles.centered, flex: 1 },
    { field: 'nonGst', headerName: 'NON-GST SUPPLIES (₹)', cellClass: styles.centered, headerClass: styles.centered, flex: 1 },
  ], []);

  const AccordionIcon = ({ expanded }: { expanded: boolean }) => (
    <div className={`${styles.accordionIcon} ${expanded ? styles.accordionIconExpanded : ''}`}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );

  const DynamicAgGrid = (props: any) => {
    const isLarge = props.rowData && props.rowData.length > 8;
    const style = { width: '100%', height: isLarge ? '500px' : 'auto', marginBottom: props.marginBottom || '0' };
    return (
      <div className="ag-theme-tax-jiffy ag-theme-blue-headers" style={style}>
        <AgGridReact {...props} domLayout={isLarge ? 'normal' : 'autoHeight'} />
      </div>
    );
  };

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
        {expandedAccordion === 'table4' && (
          <div className={styles.accordionContent}>
            <div className={styles.outwardSectionTitle}>4A. SUPPLIES OTHER THAN REVERSE CHARGE & E-COMMERCE</div>
            <DynamicAgGrid marginBottom="20px" theme="legacy" defaultColDef={defaultColDef} rowData={data.table4.section4A} columnDefs={colDefs4} suppressMenuHide={true} />

            <div className={styles.outwardSectionTitle}>4B. SUPPLIES ATTRACTING REVERSE CHARGE</div>
            <DynamicAgGrid marginBottom="20px" theme="legacy" defaultColDef={defaultColDef} rowData={data.table4.section4B} columnDefs={colDefs4} suppressMenuHide={true} />

            <div className={styles.outwardEcommerceGSTIN}>E-COMMERCE OPERATOR GSTIN: {data.table4.section4C_ecommerceGstin}</div>
            <div className={styles.outwardSectionTitle}>4C. SUPPLIES THROUGH E-COMMERCE (TCS)</div>
            <DynamicAgGrid theme="legacy" 
              defaultColDef={defaultColDef}
              rowData={data.table4.section4C} 
              columnDefs={colDefs4} 
              suppressMenuHide={true}
              pinnedBottomRowData={[
                { 
                  gstin: 'TOTAL SUMMARIZED RECORDS FOR TABLE 4', 
                  invoiceValue: data.table4.total.invoiceValue,
                  taxableValue: data.table4.total.taxableValue,
                  igst: data.table4.total.igst,
                  cgst: data.table4.total.cgst,
                  sgst: data.table4.total.sgst,
                  cess: data.table4.total.cess
                }
              ]}
            />
          </div>
        )}
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
        {expandedAccordion === 'table5' && (
          <div className={styles.accordionContent}>
            <div className={styles.outwardSectionTitle}>5A. OUTWARD SUPPLIES (OTHER THAN E-COMMERCE OPERATOR, RATE-WISE)</div>
            <div className={styles.outwardSectionTitleSub}>Inter-state supplies to unregistered persons (aggregated by rate)</div>
            <DynamicAgGrid marginBottom="20px" theme="legacy" defaultColDef={defaultColDef} rowData={data.table5.section5A} columnDefs={colDefs5.filter(c => !c.hide)} suppressMenuHide={true} />

            <div className={styles.outwardEcommerceGSTIN}>GSTIN OF E-COMMERCE OPERATOR <span style={{ background: '#f1f3f9', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px' }}>{data.table5.section5B_ecommerceGstin}</span></div>
            <div className={styles.outwardSectionTitle}>5B. SUPPLIES MADE THROUGH E-COMMERCE OPERATOR (TCS APPLICABLE, RATE-WISE)</div>
            <DynamicAgGrid theme="legacy" 
              defaultColDef={defaultColDef}
              rowData={data.table5.section5B} 
              columnDefs={colDefs5B} 
              suppressMenuHide={true}
              pinnedBottomRowData={[
                { 
                  gstin: 'TOTAL SUMMARIZED RECORDS FOR TABLE 5', 
                  invoiceValue: data.table5.total.invoiceValue,
                  taxableValue: data.table5.total.taxableValue,
                  igst: data.table5.total.igst,
                }
              ]}
            />
          </div>
        )}
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
        {expandedAccordion === 'table6' && (
          <div className={styles.accordionContent}>
            <div className={styles.outwardSectionTitle}>6A. EXPORTS</div>
            <DynamicAgGrid marginBottom="20px" theme="legacy" defaultColDef={defaultColDef} rowData={data.table6.section6A} columnDefs={colDefs6} suppressMenuHide={true} />

            <div className={styles.outwardSectionTitle}>6B. SUPPLIES MADE TO SEZ UNIT / SEZ DEVELOPER</div>
            <DynamicAgGrid marginBottom="20px" theme="legacy" defaultColDef={defaultColDef} rowData={data.table6.section6B} columnDefs={colDefs6} suppressMenuHide={true} />

            <div className={styles.outwardSectionTitle}>6C. DEEMED EXPORTS</div>
            <DynamicAgGrid theme="legacy" defaultColDef={defaultColDef} rowData={data.table6.section6C} columnDefs={colDefs6} suppressMenuHide={true} />
          </div>
        )}
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
            <div className={styles.outwardSectionTitle}>7A. Intra-State supplies</div>
            <div className={styles.outwardSectionTitleSub}>7A (1). Consolidated rate wise outward supplies [including supplies made through e-commerce operator attracting TCS]</div>
            <DynamicAgGrid marginBottom="20px" theme="legacy" defaultColDef={defaultColDef} rowData={data.table7.section7A1} columnDefs={colDefs7} suppressMenuHide={true} />

            <div className={styles.outwardSectionTitleSub}>7A (2). Out of supplies mentioned at 7A(1), value of supplies made through e-Commerce Operators attracting TCS (operator wise, rate wise)</div>
            <div className={styles.outwardEcommerceGSTIN}>GSTIN of e-commerce operator: {data.table7.section7A2_ecommerceGstin}</div>
            <DynamicAgGrid marginBottom="20px" theme="legacy" defaultColDef={defaultColDef} rowData={data.table7.section7A2} columnDefs={colDefs7} suppressMenuHide={true} />

            <div className={styles.outwardSectionTitle}>7B. Inter-State Supplies where invoice value is upto Rs 2.5 Lakh [Rate wise]</div>
            <div className={styles.outwardSectionTitleSub}>7B (1). Place of Supply (Name of State): {data.table7.section7B1_pos}</div>
            <DynamicAgGrid marginBottom="20px" theme="legacy" defaultColDef={defaultColDef} rowData={data.table7.section7B1} columnDefs={[...colDefs7, { field: 'stateName', headerName: 'PLACE OF SUPPLY' }]} suppressMenuHide={true} />

            <div className={styles.outwardSectionTitleSub}>7B (2). Out of the supplies mentioned in 7B (1), the supplies made through e-Commerce Operators (operator wise, rate wise)</div>
            <div className={styles.outwardEcommerceGSTIN}>GSTIN of e-commerce operator: {data.table7.section7B2_ecommerceGstin}</div>
            <DynamicAgGrid theme="legacy" defaultColDef={defaultColDef} rowData={data.table7.section7B2} columnDefs={colDefs7} suppressMenuHide={true} />
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
              pinnedBottomRowData={[
                {
                  label: data.table8.total.label,
                  nilRated: data.table8.total.nilRated,
                  exempted: data.table8.total.exempted,
                  nonGst: data.table8.total.nonGst
                }
              ]}
            />
          </div>
        )}
      </div>

    </div>
  );
}
