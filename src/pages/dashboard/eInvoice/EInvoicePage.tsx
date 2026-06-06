import React, { useState } from 'react';
import styles from './EInvoicePage.module.css';
import { useEInvoiceData } from '../../../hooks/useEInvoiceData';

const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const AlertIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const MoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1.5"></circle>
    <circle cx="19" cy="12" r="1.5"></circle>
    <circle cx="5" cy="12" r="1.5"></circle>
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const ExportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'list', label: 'List', badge: '850' },
  { id: 'unpaired-einvoice', label: 'Unpaired EInvoice', badge: '5' },
  { id: 'unpaired-invoices', label: 'Unpaired Invoices', badge: '5' },
];

export function EInvoicePage() {
  const [activeTab, setActiveTab] = useState('unpaired-invoices');
  const [globalSearch, setGlobalSearch] = useState('');
  
  const [unpairedColFilters, setUnpairedColFilters] = useState({
    gstin: '',
    partyName: '',
    invoiceNo: '',
    invoiceDate: '',
    taxRate: '',
    taxableValue: '',
    cgstValue: '',
    sgstValue: '',
  });

  const { listData, unpairedData, loading } = useEInvoiceData(activeTab, globalSearch, unpairedColFilters);

  const handleUnpairedFilterChange = (col: string, val: string) => {
    setUnpairedColFilters({ ...unpairedColFilters, [col as keyof typeof unpairedColFilters]: val });
  };

  const renderOverview = () => (
    <div className={styles.cardsGrid}>
      {/* Card 1: ACTIVE */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.iconWrapperBlue}><CheckIcon /></div>
          <div style={{ textAlign: 'right' }}>
            <span className={styles.badgeActive}>ACTIVE</span>
            <span className={styles.syncedText}>Synced 2 minutes ago</span>
          </div>
        </div>
        <div className={styles.cardBody}>
          <span className={styles.cardTitle}>TOTAL E-INVOICES</span>
          <span className={styles.cardAmount}>Rs.<br/>8,50,790.00</span>
          <div className={styles.cardSub}>
            <span className={styles.cardSubBlue}>850</span> <span className={styles.cardSubGray}>Documents generated</span>
          </div>
        </div>
        <div className={styles.divider}></div>
        <div className={styles.cardFooter}>
          <div className={styles.dotBlue}></div>
          <span>5 EInvoice Bills</span>
        </div>
      </div>

      {/* Card 2: ACTION REQUIRED */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.iconWrapperOrange}><AlertIcon /></div>
          <div style={{ textAlign: 'right' }}>
            <span className={styles.badgeAction}>ACTION REQUIRED</span>
          </div>
        </div>
        <div className={styles.cardBody}>
          <span className={styles.cardTitle}>UNPAIRED E-INVOICES</span>
          <span className={styles.cardAmount}>Rs.<br/>4,15,790.00</span>
          <div className={styles.cardSub}>
            <span className={styles.cardSubOrange}>5</span> <span className={styles.cardSubGray}>Requires reconciliation</span>
          </div>
        </div>
        <div className={styles.divider}></div>
        <div className={styles.cardFooter}>
          <div className={styles.dotOrange}></div>
          <span>5 E-Way Bills</span>
        </div>
      </div>

      {/* Card 3: PENDING */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.iconWrapperPurple}><MoreIcon /></div>
        </div>
        <div className={styles.cardBody}>
          <span className={styles.cardTitle}>E-INVOICE NOT GENERATED</span>
          <span className={styles.cardAmount}>Rs.<br/>15,18,120.00</span>
          <div className={styles.cardSub}>
            <span className={styles.cardSubPurple}>12</span> <span className={styles.cardSubGray}>Invoices pending IRN</span>
          </div>
        </div>
        <div className={styles.divider}></div>
      </div>
    </div>
  );

  const renderListTable = () => {
    return (
      <div className={styles.listContainer}>
        {/* Header */}
        <div className={styles.listHeader}>
          <div className={styles.listHeaderLeft}>
            <span className={styles.listTitle}>Invoices List</span>
            <div className={styles.searchContainer}>
              <span className={styles.searchIcon}><SearchIcon /></span>
              <input
                type="text"
                placeholder="Search entries..."
                className={styles.searchInput}
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
            </div>
          </div>
          <button className={styles.exportBtn}>
            <ExportIcon /> Export
          </button>
        </div>

        {/* Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.blueSubHeader}>
                <th colSpan={4}>BASIC DETAILS</th>
                <th colSpan={5}>SUPPLIER</th>
                <th></th>
              </tr>
              <tr className={styles.colHeaders}>
                <th>DOC<br/>TYPE<br/>CODE</th>
                <th>DOCUMENT<br/>NO</th>
                <th>DOCUMENT<br/>DATE</th>
                <th>SUPPLY<br/>TYPE<br/>CODE</th>
                <th>LEGAL<br/>NAME</th>
                <th>GSTIN</th>
                <th>ADDRESS</th>
                <th>STATE</th>
                <th>PINCODE</th>
                <th>NAME</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '40px' }}>Loading data...</td>
                </tr>
              ) : (
                listData.map((row: any, idx: number) => (
                  <tr key={idx} className={styles.tableBodyRow}>
                    <td className={styles.docTypeLabel}>{row.docTypeCode}</td>
                    <td className={row.docTypeCode === 'CRN' ? styles.docNoRed : styles.docNoBlue}>
                      {row.documentNo}
                    </td>
                    <td>{row.documentDate}</td>
                    <td>{row.supplyTypeCode}</td>
                    <td style={{ maxWidth: '100px' }}>{row.legalName.split(' ').map((w: string,i: number)=><React.Fragment key={i}>{w}<br/></React.Fragment>)}</td>
                    <td>{row.gstin.split(/(.{9})/).filter((x: string)=>x).map((w: string,i: number)=><React.Fragment key={i}>{w}<br/></React.Fragment>)}</td>
                    <td>{row.address}</td>
                    <td>{row.state.split(' ').map((w: string,i: number)=><React.Fragment key={i}>{w}<br/></React.Fragment>)}</td>
                    <td>{row.pincode}</td>
                    <td style={{ maxWidth: '100px' }}>{row.buyerName.split(' ').map((w: string,i: number)=><React.Fragment key={i}>{w}<br/></React.Fragment>)}</td>
                  </tr>
                ))
              )}
              {/* Summary Row */}
              <tr className={styles.summaryRow}>
                <td colSpan={10}>COUNT: 850</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className={styles.listFooter}>
          <div className={styles.footerText}>
            Showing 1 to 50 of 850 entries
          </div>
          <div className={styles.pagination}>
            <button className={styles.pageBtn}>&lt;</button>
            <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>3</button>
            <span className={styles.pageDots}>...</span>
            <button className={styles.pageBtn}>17</button>
            <button className={styles.pageBtn}>&gt;</button>
          </div>
        </div>
      </div>
    );
  };

  const renderUnpairedTable = () => {
    return (
      <div className={styles.listContainer}>
        {/* Header */}
        <div className={styles.listHeader}>
          <div className={styles.listHeaderLeft}>
            <span className={styles.listTitle} style={{ maxWidth: '150px' }}>
              {activeTab === 'unpaired-invoices' ? 'List of all unpaired Invoices' : 'List of all unpaired E-Invoice'}
            </span>
            <div className={styles.searchContainer}>
              <span className={styles.searchIcon}><SearchIcon /></span>
              <input
                type="text"
                placeholder="Search entries..."
                className={styles.searchInput}
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
            </div>
          </div>
          <button className={styles.exportBtn}>
            <ExportIcon /> Export
          </button>
        </div>

        {/* Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.blueColHeaders}>
                <th>GSTIN</th>
                <th>PARTY NAME</th>
                <th>INVOICE NO.</th>
                <th>INVOICE DATE</th>
                <th>TAX<br/>RATE</th>
                <th>TAXABLE VALUE</th>
                <th>CGST VALUE</th>
                <th>SGST VALUE</th>
              </tr>
              <tr className={styles.filterRow}>
                <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} value={unpairedColFilters.gstin} onChange={(e) => handleUnpairedFilterChange('gstin', e.target.value)} /></th>
                <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} value={unpairedColFilters.partyName} onChange={(e) => handleUnpairedFilterChange('partyName', e.target.value)} /></th>
                <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} value={unpairedColFilters.invoiceNo} onChange={(e) => handleUnpairedFilterChange('invoiceNo', e.target.value)} /></th>
                <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} value={unpairedColFilters.invoiceDate} onChange={(e) => handleUnpairedFilterChange('invoiceDate', e.target.value)} /></th>
                <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} value={unpairedColFilters.taxRate} onChange={(e) => handleUnpairedFilterChange('taxRate', e.target.value)} /></th>
                <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} value={unpairedColFilters.taxableValue} onChange={(e) => handleUnpairedFilterChange('taxableValue', e.target.value)} /></th>
                <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} value={unpairedColFilters.cgstValue} onChange={(e) => handleUnpairedFilterChange('cgstValue', e.target.value)} /></th>
                <th><input type="text" placeholder="Col. Filter" className={styles.filterInput} value={unpairedColFilters.sgstValue} onChange={(e) => handleUnpairedFilterChange('sgstValue', e.target.value)} /></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>Loading data...</td>
                </tr>
              ) : (
                unpairedData.map((row: any, idx: number) => (
                  <tr key={idx} className={styles.tableBodyRow}>
                    <td style={{ maxWidth: '120px' }}>{row.gstin.split(/(.{9})/).filter((x: string)=>x).map((w: string,i: number)=><React.Fragment key={i}>{w}<br/></React.Fragment>)}</td>
                    <td style={{ maxWidth: '100px' }}>{row.partyName.split(' ').map((w: string,i: number)=><React.Fragment key={i}>{w}<br/></React.Fragment>)}</td>
                    <td className={row.invoiceNo.startsWith('CRN') ? styles.docNoRed : styles.docNoBlue}>
                      {row.invoiceNo}
                    </td>
                    <td>{row.invoiceDate}</td>
                    <td>{row.taxRate}</td>
                    <td>{row.taxableValue}</td>
                    <td>{row.cgstValue}</td>
                    <td>{row.sgstValue}</td>
                  </tr>
                ))
              )}
              {/* Summary Row */}
              <tr className={styles.summaryRowUnpaired}>
                <td colSpan={4}>Count: 4</td>
                <td style={{ textAlign: 'right' }}>Total</td>
                <td style={{ textAlign: 'left' }}></td>
                <td style={{ textAlign: 'left' }}>19,980.00</td>
                <td style={{ textAlign: 'left' }}>19,980.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className={styles.listFooter}>
          <div className={styles.footerText}>
            Showing 1 to 4 of 5 entries
          </div>
          <div className={styles.pagination}>
            <button className={styles.pageBtn}>&lt;</button>
            <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>&gt;</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>E-Invoice Dashboard</h1>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setGlobalSearch('');
              setUnpairedColFilters({
                gstin: '',
                partyName: '',
                invoiceNo: '',
                invoiceDate: '',
                taxRate: '',
                taxableValue: '',
                cgstValue: '',
                sgstValue: '',
              });
            }}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
          >
            {tab.label}
            {tab.badge && <span className={styles.badge}>{tab.badge}</span>}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'list' && renderListTable()}
      {(activeTab === 'unpaired-einvoice' || activeTab === 'unpaired-invoices') && renderUnpairedTable()}
      {activeTab !== 'overview' && activeTab !== 'list' && activeTab !== 'unpaired-einvoice' && activeTab !== 'unpaired-invoices' && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          Content for {activeTab} is currently not designed.
        </div>
      )}
    </div>
  );
}
