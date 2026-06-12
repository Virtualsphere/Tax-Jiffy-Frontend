import { useState, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ColGroupDef, RowClassParams } from 'ag-grid-community';
import styles from './EWayBillPage.module.css';
import { useEWayBillData } from './hooks/useEWayBillData';

// SVG Icons
const TruckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"></rect>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
    <circle cx="5.5" cy="18.5" r="2.5"></circle>
    <circle cx="18.5" cy="18.5" r="2.5"></circle>
  </svg>
);

const PartBIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    <circle cx="12" cy="14" r="3"></circle>
    <path d="M12 11v3"></path>
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
    <line x1="10" y1="14" x2="14" y2="18"></line>
    <line x1="14" y1="14" x2="10" y2="18"></line>
  </svg>
);

const BoxIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

const DocumentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const SearchIcon = () => (
  <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const DownloadIcon = () => (
  <svg className={styles.exportIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const LinkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

// Small icons for partially matched table
const TruckIconSmall = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"></rect>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
    <circle cx="5.5" cy="18.5" r="2.5"></circle>
    <circle cx="18.5" cy="18.5" r="2.5"></circle>
  </svg>
);

const DocumentIconSmall = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5c73e8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'list', label: 'List', badge: '850' },
  { id: 'unlinked-ewaybill', label: 'Unlinked Ewaybill', badge: '15' },
  { id: 'unlinked-invoice', label: 'Unlinked Invoice', badge: '38' },
  { id: 'partially-matched', label: 'Partially matched', badge: '55' },
];

export function EWayBillPage() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Filter state
  const [globalSearch, setGlobalSearch] = useState('');
  const [colFilters, setColFilters] = useState<Record<string, string>>({});

  const { listData, unlinkedEWayBillData, unlinkedInvoiceData, partiallyMatchedData, loading } = useEWayBillData(activeTab, globalSearch, colFilters);

  const handleColFilterChange = useCallback((col: string, val: string) => {
    setColFilters(prev => ({ ...prev, [col]: val }));
  }, []);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'ACTIVE': return styles.statusActive;
      case 'PENDING': return styles.statusPending;
      case 'EXPIRING': return styles.statusExpiring;
      default: return '';
    }
  };

  const CustomFloatingFilter = useCallback((props: any) => {
    const field = props.column.colId;
    return (
      <input 
        type="text" 
        placeholder="Col. Filter" 
        className={styles.filterInput} 
        value={props.filterValues[field] || ''} 
        onChange={(e) => props.onFilterChange(field, e.target.value)} 
      />
    );
  }, []);

  const invoiceColDefs = useMemo<(ColDef | ColGroupDef)[]>(() => [
    {
      headerName: 'DOCUMENT INFO',
      children: [
        { 
          field: 'docNo', headerName: 'Document No.', floatingFilter: true,
          floatingFilterComponent: CustomFloatingFilter,
          floatingFilterComponentParams: { onFilterChange: handleColFilterChange, filterValues: colFilters },
          cellRenderer: (p: any) => <a href="#" className={styles.linkText}>{p.value}</a>
        },
        { 
          field: 'docDate', headerName: 'Document Date', floatingFilter: true,
          floatingFilterComponent: CustomFloatingFilter,
          floatingFilterComponentParams: { onFilterChange: handleColFilterChange, filterValues: colFilters }
        },
        { 
          field: 'docType', headerName: 'Document Type', floatingFilter: true,
          floatingFilterComponent: CustomFloatingFilter,
          floatingFilterComponentParams: { onFilterChange: handleColFilterChange, filterValues: colFilters }
        },
      ]
    },
    {
      headerName: 'PARTY DETAILS',
      children: [
        { 
          field: 'partyGstin', headerName: 'Party GSTIN', floatingFilter: true,
          floatingFilterComponent: CustomFloatingFilter,
          floatingFilterComponentParams: { onFilterChange: handleColFilterChange, filterValues: colFilters }
        },
      ]
    },
    {
      headerName: 'FINANCIALS',
      children: [
        { 
          field: 'assessableValue', headerName: 'Assessable Value', floatingFilter: true,
          floatingFilterComponent: CustomFloatingFilter,
          floatingFilterComponentParams: { onFilterChange: handleColFilterChange, filterValues: colFilters },
          cellClass: styles.valueCell
        },
        { 
          field: 'sgstValue', headerName: 'SGST Value', floatingFilter: true,
          floatingFilterComponent: CustomFloatingFilter,
          floatingFilterComponentParams: { onFilterChange: handleColFilterChange, filterValues: colFilters },
          cellClass: styles.valueCellLight
        },
        { 
          field: 'cgstValue', headerName: 'CGST Value', floatingFilter: true,
          floatingFilterComponent: CustomFloatingFilter,
          floatingFilterComponentParams: { onFilterChange: handleColFilterChange, filterValues: colFilters },
          cellClass: styles.valueCellLight
        },
      ]
    }
  ], [colFilters, handleColFilterChange, CustomFloatingFilter]);

  const ewayBillColDefs = useMemo<(ColDef | ColGroupDef)[]>(() => [
    {
      headerName: 'EWAY BILL DETAILS',
      children: [
        { 
          field: 'ewayBillNo', headerName: 'Eway Bill No.', floatingFilter: true,
          floatingFilterComponent: CustomFloatingFilter,
          floatingFilterComponentParams: { onFilterChange: handleColFilterChange, filterValues: colFilters },
          cellRenderer: (p: any) => <a href="#" className={styles.linkText}>{p.value}</a>
        },
        { 
          field: 'ewbDateTime', headerName: 'EWB Date & Time', floatingFilter: true,
          floatingFilterComponent: CustomFloatingFilter,
          floatingFilterComponentParams: { onFilterChange: handleColFilterChange, filterValues: colFilters },
          cellRenderer: (p: any) => <div>{p.value?.split(' ').map((line: string, i: number) => <div key={i}>{line}</div>)}</div>,
          autoHeight: true
        },
        { 
          field: 'docType', headerName: 'Document Type', floatingFilter: true,
          floatingFilterComponent: CustomFloatingFilter,
          floatingFilterComponentParams: { onFilterChange: handleColFilterChange, filterValues: colFilters }
        },
        { 
          field: 'docDate', headerName: 'Document Date', floatingFilter: true,
          floatingFilterComponent: CustomFloatingFilter,
          floatingFilterComponentParams: { onFilterChange: handleColFilterChange, filterValues: colFilters },
          cellRenderer: (p: any) => <div>{p.value?.split('-').map((line: string, i: number) => <span key={i}>{line}{i < 2 ? '-' : ''}</span>)}</div>
        },
      ]
    },
    {
      headerName: 'PARTY DETAILS',
      children: [
        { 
          field: 'partyGstin', headerName: 'Party GSTIN', floatingFilter: true,
          floatingFilterComponent: CustomFloatingFilter,
          floatingFilterComponentParams: { onFilterChange: handleColFilterChange, filterValues: colFilters }
        },
        { 
          field: 'transporterGstin', headerName: 'Transporter GSTIN', floatingFilter: true,
          floatingFilterComponent: CustomFloatingFilter,
          floatingFilterComponentParams: { onFilterChange: handleColFilterChange, filterValues: colFilters }
        },
      ]
    },
    { 
      field: 'status', headerName: 'STATUS', floatingFilter: true,
      floatingFilterComponent: CustomFloatingFilter,
      floatingFilterComponentParams: { onFilterChange: handleColFilterChange, filterValues: colFilters },
      cellRenderer: (p: any) => <span className={`${styles.statusBadge} ${getStatusClass(p.value)}`}>{p.value}</span>
    },
    { 
      field: 'value', headerName: 'ASSESSABLE', floatingFilter: true,
      floatingFilterComponent: CustomFloatingFilter,
      floatingFilterComponentParams: { onFilterChange: handleColFilterChange, filterValues: colFilters },
      cellClass: styles.valueCell
    },
  ], [colFilters, handleColFilterChange, CustomFloatingFilter]);

  const listColDefs = useMemo<(ColDef | ColGroupDef)[]>(() => [
    {
      headerName: 'EWAY BILL DETAILS',
      children: [
        { field: 'ewayBillNo', headerName: 'Eway Bill No.', cellRenderer: (p: any) => <a href="#" className={styles.linkText}>{p.value}</a> },
        { field: 'ewbDateTime', headerName: 'EWB Date & Time', cellRenderer: (p: any) => <div>{p.value?.split(' ').map((line: string, i: number) => <div key={i}>{line}</div>)}</div>, autoHeight: true },
        { field: 'docType', headerName: 'Document Type' },
        { field: 'docDate', headerName: 'Document Date', cellRenderer: (p: any) => <div>{p.value?.split('-').map((line: string, i: number) => <span key={i}>{line}{i < 2 ? '-' : ''}</span>)}</div> },
        { field: 'partyGstin', headerName: 'Party GSTIN' },
        { field: 'transporterGstin', headerName: 'Transporter GSTIN' },
        { field: 'status', headerName: 'Status', cellRenderer: (p: any) => <span className={`${styles.statusBadge} ${getStatusClass(p.value)}`}>{p.value}</span> },
        { field: 'value', headerName: 'Assessable Value (₹)', cellClass: styles.valueCell },
      ]
    }
  ], []);

  const reconColDefs = useMemo<(ColDef | ColGroupDef)[]>(() => [
    {
      headerName: '',
      children: [
        {
          field: 'gstin', headerName: 'GSTIN', 
          colSpan: (p: any) => p.data.rowType === 'total' ? 3 : 1,
          cellRenderer: (p: any) => p.data.rowType === 'total' ? 'TOTAL (LINKED DOCUMENTS)' : <span className={p.data.rowType === 'child' ? styles.lightText : ''}>{p.value}</span>,
          cellClass: (p: any) => p.data.rowType === 'total' ? styles.totalLabelCell : ''
        },
        {
          field: 'docNo', headerName: 'LINKED DOCUMENT TYPES & NO.',
          cellRenderer: (p: any) => {
            if (p.data.rowType === 'total') return null;
            return (
              <div className={styles.linkDocCell}>
                {p.data.docType === 'INV' ? <DocumentIconSmall /> : <TruckIconSmall />}
                {p.data.rowType === 'parent' ? <a href="#" className={styles.linkText}>{p.value}</a> : <span className={styles.lightText}>{p.value}</span>}
              </div>
            );
          }
        },
        {
          field: 'date', headerName: 'DATE',
          cellRenderer: (p: any) => {
            if (p.data.rowType === 'total') return null;
            return <div className={p.data.rowType === 'child' ? styles.lightText : ''}>{p.value?.split('-').map((line: string, i: number) => <span key={i}>{line}{i < 2 ? '-' : ''}<br/></span>)}</div>;
          },
          autoHeight: true
        }
      ]
    },
    {
      headerName: 'TAX VALUES',
      children: [
        { field: 'assessableValue', headerName: 'ASSESSABLE VALUE', cellRenderer: (p: any) => `₹ ${p.value}`, cellClass: (p: any) => p.data.rowType === 'parent' ? styles.valueCellBold : (p.data?.rowType === 'child' ? styles.lightText : '') },
        { field: 'sgstValue', headerName: 'SGST VALUE', cellRenderer: (p: any) => `₹ ${p.value}`, cellClass: (p: any) => p.data.rowType === 'parent' ? styles.valueCellBold : (p.data?.rowType === 'child' ? styles.lightText : '') },
        { field: 'cgstValue', headerName: 'CGST VALUE', cellRenderer: (p: any) => `₹ ${p.value}`, cellClass: (p: any) => p.data.rowType === 'parent' ? styles.valueCellBold : (p.data?.rowType === 'child' ? styles.lightText : '') },
        { field: 'igstValue', headerName: 'IGST VALUE', cellRenderer: (p: any) => `₹ ${p.value}`, cellClass: (p: any) => p.data.rowType === 'parent' ? styles.valueCellBold : (p.data?.rowType === 'child' ? styles.lightText : '') },
        { field: 'totalValue', headerName: 'TOTAL INVOICE VALUE', cellRenderer: (p: any) => `₹ ${p.value}`, cellClass: (p: any) => p.data.rowType === 'parent' ? styles.valueCellBold : (p.data?.rowType === 'child' ? styles.lightText : '') },
      ]
    }
  ], []);

  const getReconRowClass = (params: RowClassParams) => {
    if (params.data.rowType === 'parent') return styles.rowParent;
    if (params.data.rowType === 'child') return styles.rowChild;
    if (params.data.rowType === 'total') return styles.rowTotal;
    return '';
  };


  const renderPartiallyMatchedView = () => {
    return (
      <div className={styles.partiallyMatchedContainer}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading partially matched data...</div>
        ) : (
          partiallyMatchedData.map((group: any, groupIndex: number) => {
            const flatData: any[] = [];
            group.recordBlocks.forEach((block: any) => {
              flatData.push({ ...block.parent, rowType: 'parent' });
              block.children.forEach((child: any) => {
                flatData.push({ ...child, rowType: 'child' });
              });
              flatData.push({ ...block.totals, rowType: 'total' });
            });

            return (
              <div key={groupIndex} className={styles.reconCard}>
                <div className={styles.reconHeader}>
                  <div className={styles.reconHeaderLeft}>
                    <span className={group.type === 'ONE-TO-MANY' ? styles.badgeOneToMany : styles.badgeManyToOne}>
                      {group.type}
                    </span>
                    <span className={styles.reconTitle}>Reconciliation: {group.title}</span>
                  </div>
                  <span className={styles.badgePartiallyMatched}>{group.status}</span>
                </div>

                <div className="ag-theme-tax-jiffy" style={{ width: '100%', height: '500px' }}>
                  <AgGridReact theme="legacy"
                    rowData={flatData}
                    columnDefs={reconColDefs}
                    domLayout="autoHeight"
                    getRowClass={getReconRowClass}
                    suppressMenuHide={true}
                  />
                </div>

                {/* Footer */}
                <div className={styles.paginationRecon}>
                  <div className={styles.rowsPerPage}>
                    <span>Rows per page:</span>
                    <div className={styles.selectWrapper}>
                      <select className={styles.rowsSelect}>
                        <option>10</option>
                      </select>
                    </div>
                    <span>Showing 1-3 of 3 records</span>
                  </div>
                  <div className={styles.paginationControls}>
                    <button className={`${styles.pageBtn} ${styles.pageBtnOutline}`}><ChevronLeftIcon /></button>
                    <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
                    <button className={`${styles.pageBtn} ${styles.pageBtnOutline}`}><ChevronRightIcon /></button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  const renderTable = (
    title: string,
    searchPlaceholder: string,
    tabType: 'list' | 'unlinked-ewaybill' | 'unlinked-invoice'
  ) => {
    let currentData: any[] = [];
    if (tabType === 'list') currentData = listData;
    else if (tabType === 'unlinked-ewaybill') currentData = unlinkedEWayBillData;
    else if (tabType === 'unlinked-invoice') currentData = unlinkedInvoiceData;

    const isInvoice = tabType === 'unlinked-invoice';
    const isEwayBill = tabType === 'unlinked-ewaybill';

    let totalEntries = 850;
    if (tabType === 'unlinked-ewaybill') totalEntries = 15;
    if (tabType === 'unlinked-invoice') totalEntries = 38;

    let colDefs = listColDefs;
    if (isInvoice) colDefs = invoiceColDefs;
    if (isEwayBill) colDefs = ewayBillColDefs;

    let pinnedBottomRowData;
    if (!loading && isInvoice) {
      pinnedBottomRowData = [{ docNo: `Count: ${currentData.length}`, assessableValue: 'Total ₹', sgstValue: '23,815.00', cgstValue: '23,815.00' }];
    } else if (!loading && tabType === 'list') {
      pinnedBottomRowData = [{ ewayBillNo: `Count: ${currentData.length}`, value: 'Total' }];
    }

    return (
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <div className={styles.tableHeaderTitle}>{title}</div>
          <div className={styles.tableActions}>
            <div className={styles.searchInputWrapper}>
              <SearchIcon />
              <input 
                type="text" 
                placeholder={searchPlaceholder} 
                className={styles.searchInput} 
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
            </div>
            <button className={styles.exportBtn}>
              <DownloadIcon />
              Export
            </button>
          </div>
        </div>

        <div className="ag-theme-tax-jiffy ag-theme-blue-group-headers" style={{ width: '100%', height: '500px' }}>
          <AgGridReact theme="legacy"
            rowData={loading ? undefined : currentData}
            columnDefs={colDefs}
            domLayout="autoHeight"
            suppressMenuHide={true}
            pinnedBottomRowData={pinnedBottomRowData}
          />
        </div>

        {/* Pagination */}
        <div className={styles.pagination}>
          <span>Showing 1-{Math.min(tabType === 'list' ? 3 : 5, currentData.length)} of {totalEntries} entries</span>
          <div className={styles.paginationControls}>
            <button className={`${styles.pageBtn} ${styles.pageBtnOutline}`}><ChevronLeftIcon /></button>
            <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>3</button>
            {tabType === 'list' && <span>...</span>}
            {tabType === 'list' && <button className={styles.pageBtn}>284</button>}
            <button className={`${styles.pageBtn} ${styles.pageBtnOutline}`}><ChevronRightIcon /></button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>E-Way Bill Dashboard</h1>

      {/* Top Cards Row */}
      <div className={styles.topCardsRow}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryHeader}>
            <div className={`${styles.iconBox} ${styles.iconBoxBlue}`}><TruckIcon /></div>
            <span className={styles.cardBadge}>ACTIVE</span>
          </div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryTitle}>In transport</span>
            <span className={styles.summaryAmount}>₹8,50,790.00</span>
            <span className={styles.summarySub}><span className={styles.summarySubCount}>5</span> <span className={styles.summarySubLabel}>Eway Bill</span></span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryHeader}>
            <div className={`${styles.iconBox} ${styles.iconBoxOrange}`}><PartBIcon /></div>
          </div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryTitle}>Part B not Filled</span>
            <span className={styles.summaryAmount}>₹4,20,200.00</span>
            <span className={styles.summarySub}><span className={styles.summarySubCount}>2</span> <span className={styles.summarySubLabel}>Eway Bill</span></span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryHeader}>
            <div className={`${styles.iconBox} ${styles.iconBoxBlack}`}><CalendarIcon /></div>
          </div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryTitle}>Expiring Today</span>
            <span className={styles.summaryAmount}>₹2,18,254.00</span>
            <span className={styles.summarySub}><span className={styles.summarySubCount}>1</span> <span className={styles.summarySubLabel}>Eway Bill</span></span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryHeader}>
            <div className={`${styles.iconBox} ${styles.iconBoxPurple}`}><BoxIcon /></div>
          </div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryTitle}>Goods Moved, Inv. Pending</span>
            <span className={styles.summaryAmount}>₹14,50,790.00</span>
            <span className={styles.summarySub}><span className={styles.summarySubCount}>5</span> <span className={styles.summarySubLabel}>Eway Bill</span></span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryHeader}>
            <div className={`${styles.iconBox} ${styles.iconBoxGreen}`}><DocumentIcon /></div>
          </div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryTitle}>Inv. Gen, Goods Pending</span>
            <span className={styles.summaryAmount}>₹2,50,790.00</span>
            <span className={styles.summarySub}><span className={styles.summarySubCount}>8</span> <span className={styles.summarySubLabel}>Invoices</span></span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              // Clear filters when switching tabs
              setGlobalSearch('');
              setColFilters({});
            }}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
          >
            {tab.label}
            {tab.badge && <span className={styles.badge}>{tab.badge}</span>}
          </button>
        ))}
      </div>

      {/* Overview Container */}
      {activeTab === 'overview' && (
        <>
          <div className={styles.grid}>
            {/* Card 1: Left column (spans 2 rows) */}
            <div className={`${styles.card} ${styles.leftCard}`}>
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div className={styles.iconWrapper}><TruckIcon /></div>
                  <span>ACTIVE (IN TRANSPORT)</span>
                </div>
                <div className={styles.amountWrapper}>
                  <span className={styles.amount}>Rs. 8,50,790.00</span>
                  <span className={styles.count}>5 Eway Bills</span>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div className={styles.iconWrapper}><PartBIcon /></div>
                  <span>PART B NOT FILLED</span>
                </div>
                <div className={styles.amountWrapper}>
                  <span className={styles.amount}>Rs. 4,20,200.00</span>
                  <span className={styles.count}>2 Eway Bills</span>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div className={styles.iconWrapper}><CalendarIcon /></div>
                  <span>EXPIRING TODAY</span>
                </div>
                <div className={styles.amountWrapper}>
                  <span className={styles.amount}>Rs. 2,18,254.00</span>
                  <span className={styles.count}>1 Eway Bill</span>
                </div>
              </div>
            </div>

            {/* Right Column Stack */}
            <div className={styles.rightColumn}>
              {/* Card 2: Top Right */}
              <div className={styles.card}>
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.iconWrapper}><BoxIcon /></div>
                    <span>GOODS MOVED INVOICE NOT GENERATED</span>
                  </div>
                  <div className={styles.amountWrapper}>
                    <span className={styles.amount}>Rs. 14,50,790.00</span>
                    <span className={styles.count}>5 Eway Bills</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Bottom Right */}
              <div className={styles.card}>
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.iconWrapper}><DocumentIcon /></div>
                    <span>INVOICE GENERATED GOODS NOT MOVED</span>
                  </div>
                  <div className={styles.amountWrapper}>
                    <span className={styles.amount}>Rs. 2,50,790.00</span>
                    <span className={styles.count}>8 Invoices</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Full Width Bottom */}
          <div className={`${styles.card} ${styles.bottomCard}`}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span>PARTIALLY MATCHED IN EWAY BILL VS INVOICE</span>
              </div>
              <div className={styles.amountWrapper}>
                <span className={styles.amount}>Rs. 8,50,790.00</span>
              </div>
            </div>
            
            <button className={styles.actionButton}>
              <LinkIcon />
              <span>15 Matching ID's</span>
            </button>
          </div>
        </>
      )}

      {/* List View Table Container */}
      {activeTab === 'list' && renderTable('List View', 'Search...', 'list')}

      {/* Unlinked Ewaybill Table Container */}
      {activeTab === 'unlinked-ewaybill' && renderTable('Unlinked Ewaybills', 'Search unlinked bills...', 'unlinked-ewaybill')}

      {/* Unlinked Invoice Table Container */}
      {activeTab === 'unlinked-invoice' && renderTable('Unlinked Invoices', 'Search unlinked invoices...', 'unlinked-invoice')}

      {/* Partially Matched View */}
      {activeTab === 'partially-matched' && renderPartiallyMatchedView()}

    </div>
  );
}
