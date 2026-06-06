import React, { useState } from 'react';
import styles from './EWayBillPage.module.css';
import { useEWayBillData } from '../../../hooks/useEWayBillData';

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

  const handleColFilterChange = (col: string, val: string) => {
    setColFilters(prev => ({ ...prev, [col]: val }));
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'ACTIVE': return styles.statusActive;
      case 'PENDING': return styles.statusPending;
      case 'EXPIRING': return styles.statusExpiring;
      default: return '';
    }
  };



  const renderPartiallyMatchedView = () => {
    return (
      <div className={styles.partiallyMatchedContainer}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading partially matched data...</div>
        ) : (
          partiallyMatchedData.map((group: any, groupIndex: number) => (
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

            <table className={styles.table}>
              <thead>
                <tr className={styles.blueSubHeaderMultiRecon}>
                  <th colSpan={3}></th>
                  <th colSpan={5} className={styles.taxValuesHeader}>TAX VALUES</th>
                </tr>
                <tr className={styles.reconColHeaders}>
                  <th>GSTIN</th>
                  <th>LINKED DOCUMENT<br/>TYPES & NO.</th>
                  <th>DATE</th>
                  <th>ASSESSABLE<br/>VALUE</th>
                  <th>SGST<br/>VALUE</th>
                  <th>CGST<br/>VALUE</th>
                  <th>IGST<br/>VALUE</th>
                  <th>TOTAL INVOICE<br/>VALUE</th>
                </tr>
                <tr className={`${styles.filterRow} ${styles.reconFilterRow}`}>
                  <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} /></th>
                  <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} /></th>
                  <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} /></th>
                  <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} /></th>
                  <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} /></th>
                  <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} /></th>
                  <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} /></th>
                  <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} /></th>
                </tr>
              </thead>
              <tbody>
                {group.recordBlocks.map((block: any, blockIndex: number) => (
                  <React.Fragment key={blockIndex}>
                    {/* Parent Row */}
                    <tr className={styles.rowParent}>
                      <td>{block.parent.gstin}</td>
                      <td className={styles.linkDocCell}>
                        {block.parent.docType === 'INV' ? <DocumentIconSmall /> : <TruckIconSmall />}
                        <a href="#" className={styles.linkText}>{block.parent.docNo}</a>
                      </td>
                      <td>{block.parent.date.split('-').map((line: string, i: number) => <span key={i}>{line}{i < 2 ? '-' : ''}<br/></span>)}</td>
                      <td className={styles.valueCellBold}>₹ {block.parent.assessableValue}</td>
                      <td className={styles.valueCellBold}>₹ {block.parent.sgstValue}</td>
                      <td className={styles.valueCellBold}>₹ {block.parent.cgstValue}</td>
                      <td className={styles.valueCellBold}>₹ {block.parent.igstValue}</td>
                      <td className={styles.valueCellBold}>₹ {block.parent.totalValue}</td>
                    </tr>
                    
                    {/* Child Rows */}
                    {block.children.map((child: any, childIndex: number) => (
                      <tr key={childIndex} className={styles.rowChild}>
                        <td className={styles.lightText}>{child.gstin}</td>
                        <td className={styles.linkDocCell}>
                          {child.docType === 'INV' ? <DocumentIconSmall /> : <TruckIconSmall />}
                          <span className={styles.lightText}>{child.docNo}</span>
                        </td>
                        <td className={styles.lightText}>{child.date.split('-').map((line: string, i: number) => <span key={i}>{line}{i < 2 ? '-' : ''}<br/></span>)}</td>
                        <td className={styles.lightText}>₹ {child.assessableValue}</td>
                        <td className={styles.lightText}>₹ {child.sgstValue}</td>
                        <td className={styles.lightText}>₹ {child.cgstValue}</td>
                        <td className={styles.lightText}>₹ {child.igstValue}</td>
                        <td className={styles.lightText}>₹ {child.totalValue}</td>
                      </tr>
                    ))}
                    
                    {/* Totals Row */}
                    <tr className={styles.rowTotal}>
                      <td colSpan={3} className={styles.totalLabelCell}>TOTAL (LINKED DOCUMENTS)</td>
                      <td>₹ {block.totals.assessableValue}</td>
                      <td>₹ {block.totals.sgstValue}</td>
                      <td>₹ {block.totals.cgstValue}</td>
                      <td>₹ {block.totals.igstValue}</td>
                      <td>₹ {block.totals.totalValue}</td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>

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
          ))
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

    let totalEntries = 850;
    if (tabType === 'unlinked-ewaybill') totalEntries = 15;
    if (tabType === 'unlinked-invoice') totalEntries = 38;

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

        <table className={styles.table}>
          <thead>
            {isInvoice ? (
              <tr className={styles.blueSubHeaderMulti}>
                <th colSpan={3}>DOCUMENT INFO</th>
                <th colSpan={1}>PARTY DETAILS</th>
                <th colSpan={3}>FINANCIALS</th>
              </tr>
            ) : tabType === 'unlinked-ewaybill' ? (
              <tr className={styles.blueSubHeaderMulti}>
                <th colSpan={4}>EWAY BILL DETAILS</th>
                <th colSpan={2}>PARTY DETAILS</th>
                <th>STATUS</th>
                <th>ASSESSABLE</th>
              </tr>
            ) : (
              <tr className={styles.blueSubHeader}>
                <th colSpan={8}>EWAY BILL DETAILS</th>
              </tr>
            )}

            {isInvoice ? (
              <tr>
                <th>Document No.</th>
                <th>Document<br/>Date</th>
                <th>Document<br/>Type</th>
                <th>Party GSTIN</th>
                <th>Assessable Value</th>
                <th>SGST Value</th>
                <th>CGST<br/>Value</th>
              </tr>
            ) : (
              <tr>
                <th>Eway Bill No.</th>
                <th>EWB<br/>Date & Time</th>
                <th>Document<br/>Type</th>
                <th>Document<br/>Date</th>
                <th>Party GSTIN</th>
                <th>Transporter GSTIN</th>
                <th>Status</th>
                <th>Assessable<br/>Value (₹)</th>
              </tr>
            )}

            {isInvoice ? (
              <tr className={styles.filterRow}>
                <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} value={colFilters.docNo || ''} onChange={e => handleColFilterChange('docNo', e.target.value)} /></th>
                <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} value={colFilters.docDate || ''} onChange={e => handleColFilterChange('docDate', e.target.value)} /></th>
                <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} value={colFilters.docType || ''} onChange={e => handleColFilterChange('docType', e.target.value)} /></th>
                <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} value={colFilters.partyGstin || ''} onChange={e => handleColFilterChange('partyGstin', e.target.value)} /></th>
                <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} value={colFilters.assessableValue || ''} onChange={e => handleColFilterChange('assessableValue', e.target.value)} /></th>
                <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} value={colFilters.sgstValue || ''} onChange={e => handleColFilterChange('sgstValue', e.target.value)} /></th>
                <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} value={colFilters.cgstValue || ''} onChange={e => handleColFilterChange('cgstValue', e.target.value)} /></th>
              </tr>
            ) : (
              <tr className={styles.filterRow}>
                <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} value={colFilters.ewayBillNo || ''} onChange={e => handleColFilterChange('ewayBillNo', e.target.value)} /></th>
                <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} value={colFilters.ewbDateTime || ''} onChange={e => handleColFilterChange('ewbDateTime', e.target.value)} /></th>
                <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} value={colFilters.docType || ''} onChange={e => handleColFilterChange('docType', e.target.value)} /></th>
                <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} value={colFilters.docDate || ''} onChange={e => handleColFilterChange('docDate', e.target.value)} /></th>
                <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} value={colFilters.partyGstin || ''} onChange={e => handleColFilterChange('partyGstin', e.target.value)} /></th>
                <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} value={colFilters.transporterGstin || ''} onChange={e => handleColFilterChange('transporterGstin', e.target.value)} /></th>
                <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} value={colFilters.status || ''} onChange={e => handleColFilterChange('status', e.target.value)} /></th>
                <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} value={colFilters.value || ''} onChange={e => handleColFilterChange('value', e.target.value)} /></th>
              </tr>
            )}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={isInvoice ? 7 : 8} style={{ textAlign: 'center', padding: '40px' }}>Loading data...</td>
              </tr>
            ) : isInvoice ? (
              currentData.map((row) => (
                <tr key={row.docNo}>
                  <td><a href="#" className={styles.linkText}>{row.docNo}</a></td>
                  <td>{row.docDate}</td>
                  <td>{row.docType}</td>
                  <td>{row.partyGstin}</td>
                  <td className={styles.valueCell}>{row.assessableValue}</td>
                  <td className={styles.valueCellLight}>{row.sgstValue}</td>
                  <td className={styles.valueCellLight}>{row.cgstValue}</td>
                </tr>
              ))
            ) : (
              currentData.map((row) => (
                <tr key={row.ewayBillNo}>
                  <td><a href="#" className={styles.linkText}>{row.ewayBillNo}</a></td>
                  <td>{row.ewbDateTime.split(' ').map((line: string, i: number) => <div key={i}>{line}</div>)}</td>
                  <td>{row.docType}</td>
                  <td>{row.docDate.split('-').map((line: string, i: number) => <span key={i}>{line}{i < 2 ? '-' : ''}</span>)}</td>
                  <td>{row.partyGstin}</td>
                  <td>{row.transporterGstin}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className={styles.valueCell}>{row.value}</td>
                </tr>
              ))
            )}

            {/* Footer Row */}
            {!loading && (isInvoice ? (
              <tr className={styles.footerRow}>
                <td colSpan={4}>Count: {currentData.length}</td>
                <td style={{ textAlign: 'right', paddingRight: '24px' }}>Total ₹</td>
                <td>23,815.00</td>
                <td>23,815.00</td>
              </tr>
            ) : tabType === 'list' ? (
              <tr className={styles.footerRow}>
                <td colSpan={7}>Count: {currentData.length}</td>
                <td>Total</td>
              </tr>
            ) : null)}
          </tbody>
        </table>

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
