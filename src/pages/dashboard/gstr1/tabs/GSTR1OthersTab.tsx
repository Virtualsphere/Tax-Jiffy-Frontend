import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ColGroupDef } from 'ag-grid-community';
import styles from '../GSTR1Page.module.css';

interface GSTR1OthersTabProps {
  data: any;
  expandedAccordion: string | null;
  setExpandedAccordion: (val: string | null) => void;
}

export function GSTR1OthersTab({ data, expandedAccordion, setExpandedAccordion }: GSTR1OthersTabProps) {

  const colDefs12 = useMemo<(ColDef | ColGroupDef)[]>(() => [
    {
      headerName: 'Items',
      children: [
        { field: 'srNo', headerName: 'Sr. No.', valueGetter: 'node.rowIndex + 1', cellClass: styles.centered, headerClass: styles.centered },
        { field: 'hsn', headerName: 'HSN', cellClass: styles.centered, headerClass: styles.centered },
        { field: 'description', headerName: 'Description', cellClass: styles.centered, headerClass: styles.centered },
        { field: 'uqc', headerName: 'UQC', cellClass: styles.centered, headerClass: styles.centered },
      ]
    },
    {
      headerName: 'Quantity & Value',
      children: [
        { field: 'totalQuantity', headerName: 'Total Quantity', cellClass: styles.centered, headerClass: styles.centered },
        { field: 'totalValue', headerName: 'Total Value', cellClass: styles.centered, headerClass: styles.centered },
      ]
    },
    {
      headerName: 'Tax Details',
      children: [
        { field: 'taxableValue', headerName: 'Taxable Value', cellClass: styles.centered, headerClass: styles.centered },
        { field: 'integratedTax', headerName: 'Integrated Tax', cellClass: styles.centered, headerClass: styles.centered },
        { field: 'centralTax', headerName: 'Central Tax', cellClass: styles.centered, headerClass: styles.centered },
        { field: 'stateTax', headerName: 'State/UT Tax', cellClass: styles.centered, headerClass: styles.centered },
        { field: 'cess', headerName: 'Cess', cellClass: styles.centered, headerClass: styles.centered },
      ]
    }
  ], []);

  const colDefs13 = useMemo<(ColDef | ColGroupDef)[]>(() => [
    { field: 'srNo', headerName: 'Sr. No.', valueGetter: 'node.rowIndex + 1', cellClass: styles.centered, headerClass: styles.centered },
    { field: 'natureOfDocument', headerName: 'Nature of document', cellClass: styles.centered, headerClass: styles.centered },
    {
      headerName: 'Sr. No.',
      children: [
        { field: 'from', headerName: 'From', cellClass: styles.centered, headerClass: styles.centered },
        { field: 'to', headerName: 'To', cellClass: styles.centered, headerClass: styles.centered },
      ]
    },
    { field: 'totalNumber', headerName: 'Total number', cellClass: styles.centered, headerClass: styles.centered },
    { field: 'cancelled', headerName: 'Cancelled', cellClass: styles.centered, headerClass: styles.centered },
    { field: 'netIssued', headerName: 'Net issued', cellClass: styles.centered, headerClass: styles.centered },
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
            <div className="ag-theme-tax-jiffy" style={{ width: '100%', height: '300px' }}>
              <AgGridReact theme="legacy" 
                rowData={data.table12.records} 
                columnDefs={colDefs12} 
                domLayout="autoHeight" 
                suppressMenuHide={true}
                pinnedBottomRowData={[
                  {
                    hsn: 'Total',
                    totalQuantity: data.table12.total.totalQuantity,
                    totalValue: data.table12.total.totalValue,
                    taxableValue: data.table12.total.taxableValue,
                    integratedTax: data.table12.total.integratedTax,
                    centralTax: data.table12.total.centralTax,
                    stateTax: data.table12.total.stateTax,
                    cess: data.table12.total.cess
                  }
                ]}
              />
            </div>
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
            <div className="ag-theme-tax-jiffy" style={{ width: '100%', height: '300px' }}>
              <AgGridReact theme="legacy" 
                rowData={data.table13.records} 
                columnDefs={colDefs13} 
                domLayout="autoHeight" 
                suppressMenuHide={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
