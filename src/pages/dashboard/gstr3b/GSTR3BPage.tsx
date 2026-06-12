import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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

const MOCK_DATA_4 = [
  { label: '(A) ITC Available (whether in full or part)', isSectionHeader: true },
  { label: '(1) Import of goods', integratedTax: '0.00', centralTax: '0.00', stateTax: '0.00', cess: '0.00' },
  { label: '(2) Import of services', integratedTax: '0.00', centralTax: '0.00', stateTax: '0.00', cess: '0.00' },
  { label: '(3) Inward supplies liable to reverse charge (other than 1 & 2 above)', integratedTax: '12,500.00', centralTax: '6,250.00', stateTax: '6,250.00', cess: '0.00' },
  { label: '(4) Inward supplies from ISD', integratedTax: '0.00', centralTax: '0.00', stateTax: '0.00', cess: '0.00' },
  { label: '(5) All other ITC', integratedTax: '85,420.00', centralTax: '42,710.00', stateTax: '42,710.00', cess: '1,200.00' },
  { label: '(B) ITC Reversed', isSectionHeader: true },
  { label: '(1) As per rules 42 & 43 of CGST Rules', integratedTax: '0.00', centralTax: '0.00', stateTax: '0.00', cess: '0.00' },
  { label: '(2) Others', integratedTax: '2,150.00', centralTax: '1,075.00', stateTax: '1,075.00', cess: '0.00' },
  { label: '(C) Net ITC Available (A - B)', isSectionHeader: true, integratedTax: '95,770.00', centralTax: '47,885.00', stateTax: '47,885.00', cess: '1,200.00' },
  { label: '(D) Ineligible ITC', isSectionHeader: true },
  { label: '(1) As per section 17(5)', integratedTax: '450.00', centralTax: '225.00', stateTax: '225.00', cess: '0.00' },
  { label: '(2) Others', integratedTax: '0.00', centralTax: '0.00', stateTax: '0.00', cess: '0.00' },
];

const MOCK_DATA_5 = [
  { label: '(A) From a supplier under composition scheme, Exempt and Nil rated supply', nilRated: '1,250.00', exempted: '5,400.00', nonGst: '0.00' },
  { label: '(B) Non-GST inward supplies', nilRated: '0.00', exempted: '0.00', nonGst: '18,200.00' },
];

const MOCK_DATA_6_1 = [
  { label: 'Integrated Tax', taxPayable: '1,25,000.00', itcIntegrated: '85,000.00', itcCentral: '0.00', itcState: '0.00', itcCess: '0.00', cash: '40,000.00', interest: '0.00', lateFee: '0.00' },
  { label: 'Central Tax', taxPayable: '62,500.00', itcIntegrated: '12,500.00', itcCentral: '50,000.00', itcState: '0.00', itcCess: '0.00', cash: '0.00', interest: '0.00', lateFee: '0.00' },
  { label: 'State/UT Tax', taxPayable: '62,500.00', itcIntegrated: '12,500.00', itcCentral: '0.00', itcState: '50,000.00', itcCess: '0.00', cash: '0.00', interest: '0.00', lateFee: '0.00' },
  { label: 'Cess', taxPayable: '5,000.00', itcIntegrated: '0.00', itcCentral: '0.00', itcState: '0.00', itcCess: '4,500.00', cash: '500.00', interest: '0.00', lateFee: '0.00' },
];

const MOCK_DATA_6_2 = [
  { label: 'Integrated Tax', tdsIntegrated: '12,000.00', tdsCentral: '0.00', tdsState: '0.00', tcsIntegrated: '4,500.00', tcsCentral: '0.00', tcsState: '0.00' },
  { label: 'Central Tax', tdsIntegrated: '0.00', tdsCentral: '6,000.00', tdsState: '0.00', tcsIntegrated: '0.00', tcsCentral: '2,250.00', tcsState: '0.00' },
  { label: 'State/UT Tax', tdsIntegrated: '0.00', tdsCentral: '0.00', tdsState: '6,000.00', tcsIntegrated: '0.00', tcsCentral: '0.00', tcsState: '2,250.00' },
  { label: 'Total', isTotal: true, tdsIntegrated: '12,000.00', tdsCentral: '6,000.00', tdsState: '6,000.00', tcsIntegrated: '4,500.00', tcsCentral: '2,250.00', tcsState: '2,250.00' },
];

export function GSTR3BPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('Basic');
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
  const [isFiled, setIsFiled] = useState(false);

  const toggleAccordion = (id: string) => {
    setExpandedAccordion((prev) => (prev === id ? null : id));
  };

  const handleConfirm = () => {
    setIsFiled(true);
  };

  const defaultColDef = useMemo<ColDef>(() => ({
    wrapHeaderText: true,
    autoHeaderHeight: true,
    resizable: true,
  }), []);

  const colDefs31 = useMemo<(ColDef | ColGroupDef)[]>(() => [
    { field: 'label', headerName: 'NATURE OF SUPPLIES', flex: 2, cellClass: 'ag-cell-left', headerClass: 'ag-header-cell-left' },
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
    { 
      field: 'label', 
      headerName: 'NATURE OF SUPPLIES', 
      flex: 2, 
      cellClass: 'ag-cell-left', 
      headerClass: 'ag-header-cell-left',
      cellStyle: (p: any) => p.node?.rowPinned === 'bottom' ? { textAlign: 'center', fontWeight: 'bold' } : null 
    },
    { 
      field: 'taxableValue', 
      headerName: 'TOTAL TAXABLE VALUE (₹)', 
      cellClass: 'ag-cell-right', 
      headerClass: 'ag-header-cell-right', 
      flex: 1,
      cellStyle: (p: any) => p.node?.rowPinned === 'bottom' ? { fontWeight: 'bold' } : null 
    },
    { 
      field: 'integratedTax', 
      headerName: 'AMOUNT OF INTEGRATED TAX (₹)', 
      cellClass: 'ag-cell-right', 
      headerClass: 'ag-header-cell-right', 
      flex: 1,
      cellStyle: (p: any) => p.node?.rowPinned === 'bottom' ? { fontWeight: 'bold' } : null 
    },
  ], []);

  const colDefs4 = useMemo<ColDef[]>(() => [
    { field: 'label', headerName: 'DETAILS', flex: 2, cellClass: 'ag-cell-left', headerClass: 'ag-header-cell-left' },
    { field: 'integratedTax', headerName: 'INTEGRATED TAX', cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right', flex: 1 },
    { field: 'centralTax', headerName: 'CENTRAL TAX', cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right', flex: 1 },
    { field: 'stateTax', headerName: 'STATE/UT TAX', cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right', flex: 1 },
    { field: 'cess', headerName: 'CESS', cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right', flex: 1 },
  ], []);

  const colDefs5 = useMemo<ColDef[]>(() => [
    { field: 'label', headerName: 'DESCRIPTION (NATURE OF SUPPLY)', flex: 2, cellClass: 'ag-cell-left', headerClass: 'ag-header-cell-left' },
    { field: 'nilRated', headerName: 'NIL RATED SUPPLIES', cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right', flex: 1 },
    { field: 'exempted', headerName: 'EXEMPTED (OTHER THAN NIL RATED/NON-GST SUPPLY)', cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right', flex: 1 },
    { field: 'nonGst', headerName: 'NON-GST SUPPLIES', cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right', flex: 1 },
  ], []);

  const colDefs61 = useMemo<(ColDef | ColGroupDef)[]>(() => [
    { field: 'label', headerName: 'DESCRIPTION', flex: 1.5, cellClass: 'ag-cell-left', headerClass: 'ag-header-cell-left' },
    { field: 'taxPayable', headerName: 'TAX PAYABLE', cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right', flex: 1 },
    {
      headerName: 'PAID THROUGH ITC',
      children: [
        { field: 'itcIntegrated', headerName: 'INTEGRATED TAX', cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right' },
        { field: 'itcCentral', headerName: 'CENTRAL TAX', cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right' },
        { field: 'itcState', headerName: 'STATE/UT TAX', cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right' },
        { field: 'itcCess', headerName: 'CESS', cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right' },
      ]
    },
    { field: 'cash', headerName: 'TAX PAID IN CASH', cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right', flex: 1 },
    { field: 'interest', headerName: 'INTEREST', cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right', flex: 1 },
    { field: 'lateFee', headerName: 'LATE FEE', cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right', flex: 1 },
  ], []);

  const colDefs62 = useMemo<(ColDef | ColGroupDef)[]>(() => [
    { field: 'label', headerName: 'DETAILS', flex: 1.5, cellClass: 'ag-cell-left', headerClass: 'ag-header-cell-left' },
    {
      headerName: 'TDS CREDIT',
      children: [
        { field: 'tdsIntegrated', headerName: 'INTEGRATED TAX', cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right' },
        { field: 'tdsCentral', headerName: 'CENTRAL TAX', cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right' },
        { field: 'tdsState', headerName: 'STATE/UT TAX', cellClass: 'ag-header-cell-right', cellClass: 'ag-cell-right' },
      ]
    },
    {
      headerName: 'TCS CREDIT',
      children: [
        { field: 'tcsIntegrated', headerName: 'INTEGRATED TAX', cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right' },
        { field: 'tcsCentral', headerName: 'CENTRAL TAX', cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right' },
        { field: 'tcsState', headerName: 'STATE/UT TAX', cellClass: 'ag-cell-right', headerClass: 'ag-header-cell-right' },
      ]
    }
  ], []);

  const rowClassRules = useMemo(() => {
    return {
      'ag-row-section-header': (p: any) => p.data && p.data.isSectionHeader === true,
      'ag-row-total': (p: any) => p.data && p.data.isTotal === true
    };
  }, []);

  if (isFiled) {
    return (
      <div className={styles.page}>
        <div className={styles.successScreen}>
          <div className={styles.successCard}>
            <div className={styles.successIconWrapper}>
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="40" fill="#5a6acf" />
                <g transform="translate(16, 16) scale(2)">
                  <path stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </g>
              </svg>
            </div>
            <h2 className={styles.successTitle}>GSTR-3B Has Been Filled<br />Successfully</h2>
            <p className={styles.successSubtitle}>
              You can see the recent filed returns in the<br />Recent/Filled section of your dashboard.
            </p>
            <button type="button" className={styles.successBtn} onClick={() => navigate('/dashboard/gstr-3b')}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                <div className={`${styles.gstr3bGrid} ag-theme-tax-jiffy ag-theme-blue-headers ag-theme-blue-group-headers`} style={{ width: '100%' }}>
                  <AgGridReact theme="legacy"
                    rowData={MOCK_DATA_3_1}
                    columnDefs={colDefs31}
                    defaultColDef={defaultColDef}
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
                <div className={`${styles.gstr3bGrid} ag-theme-tax-jiffy ag-theme-blue-headers`} style={{ width: '100%' }}>
                  <AgGridReact theme="legacy"
                    rowData={MOCK_DATA_3_2}
                    columnDefs={colDefs32}
                    defaultColDef={defaultColDef}
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

      {activeTab === 'Inward' && (
        <div className={styles.outwardContainer}>
          {/* Accordion 4 */}
          <div className={styles.accordion}>
            <div
              className={styles.accordionHeader}
              onClick={() => toggleAccordion('table4')}
            >
              <div className={styles.accordionNumber}>4</div>
              <h3 className={styles.accordionTitle}>
                Table 4 - Eligible ITC
              </h3>
              <div className={`${styles.accordionIcon} ${expandedAccordion === 'table4' ? styles.accordionIconExpanded : ''}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            {expandedAccordion === 'table4' && (
              <div className={styles.accordionContent}>
                <div className={`${styles.gstr3bGrid} ag-theme-tax-jiffy ag-theme-blue-headers`} style={{ width: '100%' }}>
                  <AgGridReact theme="legacy"
                    rowData={MOCK_DATA_4}
                    columnDefs={colDefs4}
                    defaultColDef={defaultColDef}
                    rowClassRules={rowClassRules}
                    domLayout="autoHeight"
                    suppressMenuHide={true}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Accordion 5 */}
          <div className={styles.accordion}>
            <div
              className={styles.accordionHeader}
              onClick={() => toggleAccordion('table5')}
            >
              <div className={styles.accordionNumber}>5</div>
              <h3 className={styles.accordionTitle}>
                Table 5 - Values of exempt, nil-rated and non-GST inward supplies
              </h3>
              <div className={`${styles.accordionIcon} ${expandedAccordion === 'table5' ? styles.accordionIconExpanded : ''}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            {expandedAccordion === 'table5' && (
              <div className={styles.accordionContent}>
                <div className={`${styles.gstr3bGrid} ag-theme-tax-jiffy ag-theme-blue-headers`} style={{ width: '100%' }}>
                  <AgGridReact theme="legacy"
                    rowData={MOCK_DATA_5}
                    columnDefs={colDefs5}
                    defaultColDef={defaultColDef}
                    domLayout="autoHeight"
                    suppressMenuHide={true}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'Payment of Tax' && (
        <div className={styles.outwardContainer}>
          {/* Accordion 6.1 */}
          <div className={styles.accordion}>
            <div
              className={styles.accordionHeader}
              onClick={() => toggleAccordion('6.1')}
            >
              <div className={styles.accordionNumber}>6.1</div>
              <h3 className={styles.accordionTitle}>
                Payment of tax
              </h3>
              <div className={`${styles.accordionIcon} ${expandedAccordion === '6.1' ? styles.accordionIconExpanded : ''}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            {expandedAccordion === '6.1' && (
              <div className={styles.accordionContent}>
                <div className={`${styles.gstr3bGrid} ag-theme-tax-jiffy ag-theme-blue-headers ag-theme-blue-group-headers ag-theme-spreadsheet-borders`} style={{ width: '100%' }}>
                  <AgGridReact theme="legacy"
                    rowData={MOCK_DATA_6_1}
                    columnDefs={colDefs61}
                    defaultColDef={defaultColDef}
                    rowClassRules={rowClassRules}
                    domLayout="autoHeight"
                    suppressMenuHide={true}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Accordion 6.2 */}
          <div className={styles.accordion}>
            <div
              className={styles.accordionHeader}
              onClick={() => toggleAccordion('6.2')}
            >
              <div className={styles.accordionNumber}>6.2</div>
              <h3 className={styles.accordionTitle}>
                TDS/TCS Credit
              </h3>
              <div className={`${styles.accordionIcon} ${expandedAccordion === '6.2' ? styles.accordionIconExpanded : ''}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            {expandedAccordion === '6.2' && (
              <div className={styles.accordionContent}>
                <div className={`${styles.gstr3bGrid} ag-theme-tax-jiffy ag-theme-blue-headers ag-theme-blue-group-headers ag-theme-spreadsheet-borders`} style={{ width: '100%' }}>
                  <AgGridReact theme="legacy"
                    rowData={MOCK_DATA_6_2}
                    columnDefs={colDefs62}
                    defaultColDef={defaultColDef}
                    rowClassRules={rowClassRules}
                    domLayout="autoHeight"
                    suppressMenuHide={true}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Show the button only on Basic, Outward, Inward, and Payment of Tax for now to match the design. */}
      {(activeTab === 'Basic' || activeTab === 'Outward' || activeTab === 'Inward' || activeTab === 'Payment of Tax') && (
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
