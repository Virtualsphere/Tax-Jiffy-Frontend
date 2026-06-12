import { useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ColGroupDef } from 'ag-grid-community';
import styles from './GSTR3BPage.module.css';

type Tab = 'Basic' | 'Outward' | 'Inward' | 'Payment of Tax';

const TABS: Tab[] = ['Basic', 'Outward', 'Inward', 'Payment of Tax'];

const MOCK_DATA_3_1 = [
  {
    label: '(a) Outward taxable supplies (other than zero rated, nil rated and exempted)',
    taxableValue: '12,45,600.00',
    integratedTax: '1,49,472.00',
    centralTax: '37,368.00',
    stateTax: '37,368.00',
    cess: '0.00',
  },
  {
    label: '(b) Outward taxable supplies (zero rated)',
    taxableValue: '4,20,000.00',
    integratedTax: '0.00',
    centralTax: '0.00',
    stateTax: '0.00',
    cess: '0.00',
  },
  {
    label: '(c) Other outward supplies (Nil rated, exempted)',
    taxableValue: '85,000.00',
    integratedTax: '0.00',
    centralTax: '0.00',
    stateTax: '0.00',
    cess: '0.00',
  },
  {
    label: '(d) Inward supplies (liable to reverse charge)',
    taxableValue: '12,500.00',
    integratedTax: '2,250.00',
    centralTax: '0.00',
    stateTax: '0.00',
    cess: '0.00',
  },
  {
    label: '(e) Non-GST outward supplies',
    taxableValue: '0.00',
    integratedTax: '0.00',
    centralTax: '0.00',
    stateTax: '0.00',
    cess: '0.00',
  },
];

const MOCK_DATA_3_2 = [
  {
    label: '(a) Supplies made to Unregistered Persons',
    taxableValue: '3,45,200.00',
    integratedTax: '41,424.00',
  },
  {
    label: '(b) Supplies made to Composition Taxable Persons',
    taxableValue: '12,800.00',
    integratedTax: '1,536.00',
  },
  {
    label: '(c) Supplies made to UIN holders',
    taxableValue: '4,500.00',
    integratedTax: '540.00',
  },
];

export function GSTR3BPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Basic');
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setExpandedAccordion((prev) => (prev === id ? null : id));
  };

  const handleConfirm = () => {
    console.log('Confirmed Filing');
    alert('Filing confirmed successfully!');
  };

  const colDefs31 = useMemo<(ColDef | ColGroupDef)[]>(() => [
    { field: 'label', headerName: 'NATURE OF SUPPLIES', flex: 2, wrapText: true, autoHeight: true },
    { field: 'taxableValue', headerName: 'TOTAL TAXABLE VALUE (₹)', cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right', flex: 1 },
    {
      headerName: 'AMOUNT (₹)',
      children: [
        { field: 'integratedTax', headerName: 'INTEGRATED TAX', cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right' },
        { field: 'centralTax', headerName: 'CENTRAL TAX', cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right' },
        { field: 'stateTax', headerName: 'STATE/UT TAX', cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right' },
        { field: 'cess', headerName: 'CESS', cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right' },
      ]
    }
  ], []);

  const colDefs32 = useMemo<ColDef[]>(() => [
    { field: 'label', headerName: 'NATURE OF SUPPLIES', flex: 2, wrapText: true, autoHeight: true },
    { field: 'taxableValue', headerName: 'TOTAL TAXABLE VALUE (₹)', cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right', flex: 1 },
    { field: 'integratedTax', headerName: 'AMOUNT OF INTEGRATED TAX (₹)', cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right', flex: 1 },
  ], []);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Match & Confirm</h1>
        <p className={styles.pageSubtitle}>
          Validate your return data across all categories before final submission. Review the {activeTab.toLowerCase()} {activeTab === 'Outward' ? 'supply ' : ''}details below.
        </p>
      </div>

      <div className={styles.tabsContainer}>
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`${styles.tabButton} ${activeTab === tab ? styles.tabButtonActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Basic' && (
        <div className={styles.registrationCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className={styles.cardTitle}>Registration Details</h2>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>LEGAL NAME</span>
              <p className={styles.detailValue}>Vollert India Pvt Ltd</p>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>GST IDENTIFICATION NUMBER</span>
              <p className={`${styles.detailValue} ${styles.gstinValue}`}>
                09AADCV5659C1Z5
                <svg className={styles.copyIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" onClick={() => navigator.clipboard.writeText('09AADCV5659C1Z5')}>
                  <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </p>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>TAX PERIOD</span>
              <p className={styles.detailValue}>February 2023</p>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>STATUS</span>
              <div>
                <span className={styles.statusBadge}>
                  <span className={styles.statusDot} />
                  Active Registrant
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Outward' && (
        <div className={styles.outwardContainer}>
          {/* Accordion 3.1 */}
          <div className={styles.accordion}>
            <div
              className={styles.accordionHeader}
              onClick={() => toggleAccordion('3.1')}
            >
              <div className={styles.accordionNumber}>3.1</div>
              <h3 className={styles.accordionTitle}>
                Details of Outward Supplies and inward supplies liable to reverse charge
              </h3>
              <div className={`${styles.accordionIcon} ${expandedAccordion === '3.1' ? styles.accordionIconExpanded : ''}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            {expandedAccordion === '3.1' && (
              <div className={styles.accordionContent}>
                <div className="ag-theme-tax-jiffy ag-theme-blue-headers" style={{ width: '100%' }}>
                  <AgGridReact theme="legacy"
                    rowData={MOCK_DATA_3_1}
                    columnDefs={colDefs31}
                    domLayout="autoHeight"
                    suppressMenuHide={true}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Accordion 3.2 */}
          <div className={styles.accordion}>
            <div
              className={styles.accordionHeader}
              onClick={() => toggleAccordion('3.2')}
            >
              <div className={styles.accordionNumber}>3.2</div>
              <h3 className={styles.accordionTitle}>
                Of the supplies shown in 3.1 (a) above, details of inter-State supplies made to unregistered persons, composition taxable persons and UIN holders
              </h3>
              <div className={`${styles.accordionIcon} ${expandedAccordion === '3.2' ? styles.accordionIconExpanded : ''}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            {expandedAccordion === '3.2' && (
              <div className={styles.accordionContent}>
                <div className="ag-theme-tax-jiffy ag-theme-blue-headers" style={{ width: '100%' }}>
                  <AgGridReact theme="legacy"
                    rowData={MOCK_DATA_3_2}
                    columnDefs={colDefs32}
                    domLayout="autoHeight"
                    suppressMenuHide={true}
                    pinnedBottomRowData={[{ label: 'Total', taxableValue: '3,62,500.00', integratedTax: '43,500.00' }]}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Show the button only on Basic and Outward for now to match the design. In a real app, it might be on all tabs. */}
      {(activeTab === 'Basic' || activeTab === 'Outward') && (
        <div className={styles.footer}>
          <button type="button" className={styles.confirmBtn} onClick={handleConfirm}>
            Confirm Filing
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
