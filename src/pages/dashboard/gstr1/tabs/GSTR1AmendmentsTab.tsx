import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ColGroupDef } from 'ag-grid-community';
import styles from '../GSTR1Page.module.css';

interface GSTR1AmendmentsTabProps {
  data: any;
  expandedAccordion: string | null;
  setExpandedAccordion: (val: string | null) => void;
  selectedMonth: string;
  selectedYear: any;
}

export function GSTR1AmendmentsTab({ data, expandedAccordion, setExpandedAccordion, selectedMonth, selectedYear }: GSTR1AmendmentsTabProps) {

  const colDefs9 = useMemo<(ColDef | ColGroupDef)[]>(() => [
    {
      headerName: 'DETAILS OF ORIGINAL DOCUMENT',
      children: [
        { field: 'originalGstin', headerName: 'GSTIN', cellClass: styles.centered, headerClass: styles.centered },
        { field: 'originalInvNo', headerName: 'INV. NO.', cellClass: styles.centered, headerClass: styles.centered },
        { field: 'originalInvDate', headerName: 'INV. DATE', cellClass: styles.centered, headerClass: styles.centered },
      ]
    },
    {
      headerName: 'REVISED DETAILS OF DOCUMENT OR DETAILS OF ORIGINAL DEBIT/CREDIT NOTES OR REFUND VOUCHERS',
      children: [
        { field: 'revisedGstin', headerName: 'GSTIN', cellClass: styles.centered, headerClass: styles.centered },
        { field: 'revisedInvNo', headerName: 'INVOICE NO', cellClass: styles.centered, headerClass: styles.centered },
        { field: 'revisedInvDate', headerName: 'INVOICE DATE', cellClass: styles.centered, headerClass: styles.centered },
        { field: 'sbNo', headerName: 'SHIPPING BILL NO.', cellClass: styles.centered, headerClass: styles.centered },
        { field: 'sbDate', headerName: 'SHIPPING BILL DATE', cellClass: styles.centered, headerClass: styles.centered },
      ]
    },
    { field: 'value', headerName: 'VALUE', cellClass: styles.centered, headerClass: styles.centered },
    { field: 'rate', headerName: 'RATE (%)', cellClass: styles.centered, headerClass: styles.centered },
    { field: 'taxableValue', headerName: 'TAXABLE VALUE', cellClass: styles.centered, headerClass: styles.centered },
    { field: 'integratedTax', headerName: 'INTEGRATED TAX', cellClass: styles.centered, headerClass: styles.centered },
  ], []);

  const colDefs10 = useMemo<(ColDef | ColGroupDef)[]>(() => [
    { field: 'rate', headerName: 'RATE OF TAX (%)', cellClass: styles.centered, headerClass: styles.centered },
    { field: 'taxableValue', headerName: 'TOTAL TAXABLE VALUE', cellClass: styles.centered, headerClass: styles.centered },
    {
      headerName: 'AMOUNT',
      children: [
        { field: 'integrated', headerName: 'INTEGRATED TAX', cellClass: styles.centered, headerClass: styles.centered },
        { field: 'central', headerName: 'CENTRAL TAX', cellClass: styles.centered, headerClass: styles.centered },
        { field: 'state', headerName: 'STATE/UT TAX', cellClass: styles.centered, headerClass: styles.centered },
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
        {expandedAccordion === 'table9' && (
          <div className={styles.accordionContent}>
            <div className={styles.outwardSectionTitle} style={{ color: '#5a6acf' }}>9A. If the invoice/Shipping bill details furnished earlier were incorrect</div>
            <div className="ag-theme-tax-jiffy ag-theme-blue-group-headers" style={{ width: '100%', height: '400px', marginBottom: '20px' }}>
              <AgGridReact theme="legacy" rowData={data.table9.section9A} columnDefs={colDefs9} suppressMenuHide={true} />
            </div>

            <div className={styles.outwardSectionTitle} style={{ color: '#5a6acf' }}>9B. Debit Notes/Credit Notes/Refund voucher [original]</div>
            <div className="ag-theme-tax-jiffy ag-theme-blue-group-headers" style={{ width: '100%', height: '400px', marginBottom: '20px' }}>
              <AgGridReact theme="legacy" rowData={data.table9.section9B} columnDefs={colDefs9} suppressMenuHide={true} />
            </div>

            <div className={styles.outwardSectionTitle} style={{ color: '#5a6acf' }}>9C. Debit Notes/Credit Notes/Refund voucher [amendments thereof]</div>
            <div className="ag-theme-tax-jiffy ag-theme-blue-group-headers" style={{ width: '100%', height: '400px' }}>
              <AgGridReact theme="legacy" rowData={data.table9.section9C} columnDefs={colDefs9} suppressMenuHide={true} />
            </div>
          </div>
        )}
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
        {expandedAccordion === 'table10' && (
          <div className={styles.accordionContent}>
            <div className={styles.outwardSectionTitleSub}>Tax period for which the details are being revised: {selectedMonth} {selectedYear.startYear}</div>
            
            <div className={styles.outwardSectionTitle} style={{ color: '#5a6acf' }}>10A. Intra-State Supplies [including supplies made through e-commerce operator attracting TCS] [Rate wise]</div>
            <div className="ag-theme-tax-jiffy ag-theme-blue-group-headers" style={{ width: '100%', height: '400px', marginBottom: '20px' }}>
              <AgGridReact theme="legacy" rowData={data.table10.section10A} columnDefs={colDefs10} suppressMenuHide={true} />
            </div>

            <div className={styles.outwardSectionTitle} style={{ color: '#5a6acf' }}>10A (1). Out of supplies mentioned at 10A, value of supplies made through e-Commerce Operators attracting TCS (operator wise, rate wise)</div>
            <div className={styles.outwardEcommerceGSTIN}>GSTIN of e-commerce operator: {data.table10.section10A1_ecommerceGstin}</div>
            <div className="ag-theme-tax-jiffy ag-theme-blue-group-headers" style={{ width: '100%', height: '400px', marginBottom: '20px' }}>
              <AgGridReact theme="legacy" rowData={data.table10.section10A1} columnDefs={colDefs10} suppressMenuHide={true} />
            </div>

            <div className={styles.outwardSectionTitle} style={{ color: '#5a6acf' }}>10B. Inter-State Supplies [including supplies made through e-commerce operator attracting TCS] [Rate wise]</div>
            <div className={styles.outwardSectionTitleSub}>Place of Supply (Name of State): {data.table10.section10B_pos}</div>
            <div className="ag-theme-tax-jiffy ag-theme-blue-group-headers" style={{ width: '100%', height: '400px', marginBottom: '20px' }}>
              <AgGridReact theme="legacy" rowData={data.table10.section10B} columnDefs={colDefs10} suppressMenuHide={true} />
            </div>

            <div className={styles.outwardSectionTitle} style={{ color: '#5a6acf' }}>10B (1). Out of supplies mentioned at 10B, value of supplies made through e-Commerce Operators attracting TCS (operator wise, rate wise)</div>
            <div className={styles.outwardEcommerceGSTIN}>GSTIN of e-commerce operator: {data.table10.section10B1_ecommerceGstin}</div>
            <div className="ag-theme-tax-jiffy ag-theme-blue-group-headers" style={{ width: '100%', height: '400px' }}>
              <AgGridReact theme="legacy" rowData={data.table10.section10B1} columnDefs={colDefs10} suppressMenuHide={true} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
