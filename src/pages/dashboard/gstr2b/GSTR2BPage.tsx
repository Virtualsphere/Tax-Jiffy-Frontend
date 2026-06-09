import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './GSTR2BPage.module.css';
import { useGstr2bData } from './hooks/useGstr2bData';

/* ── Icons ── */
function IconGSTIN() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <text x="6" y="16" fontSize="7" fontWeight="bold" stroke="none" fill="currentColor" fontFamily="sans-serif">123</text>
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
      <path d="M9 22v-4h6v4"></path>
      <path d="M8 6h.01"></path>
      <path d="M16 6h.01"></path>
      <path d="M12 6h.01"></path>
      <path d="M12 10h.01"></path>
      <path d="M12 14h.01"></path>
      <path d="M16 10h.01"></path>
      <path d="M16 14h.01"></path>
      <path d="M8 10h.01"></path>
      <path d="M8 14h.01"></path>
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );
}

function IconStore() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  );
}

function IconCalendarCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
      <path d="M9 16l2 2 4-4"></path>
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );
}

function IconVerified() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

const TABS = ['Basic', 'ITC Available', 'ITC Inavailable'];

export function GSTR2BPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ITC Inavailable');
  const [isAccordionAExpanded, setIsAccordionAExpanded] = useState(false);
  const [isAccordionBExpanded, setIsAccordionBExpanded] = useState(false);
  const [isUnavailableAExpanded, setIsUnavailableAExpanded] = useState(false);
  const [isUnavailableBExpanded, setIsUnavailableBExpanded] = useState(false);
  const [isFiled, setIsFiled] = useState(false);

  const { data, isLoading } = useGstr2bData();

  if (isLoading) {
    return <div style={{ padding: '48px', textAlign: 'center' }}>Loading GSTR-2B data...</div>;
  }

  if (isFiled) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successCard}>
          <div className={styles.successIconBox}>
            <IconVerified />
          </div>
          <h2 className={styles.successTitle}>GSTR-2B Has Been Filed Successfully</h2>
          <p className={styles.successSubtitle}>
            You can see the recent filed returns in the
            <br />
            Recent/Filed section of your dashboard.
          </p>
          <button className={styles.successBtn} onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const renderItcRow = (row: any, idx: number) => (
    <tr key={idx}>
      <td className={styles.bold}>{row.section}</td>
      <td>{row.heading}</td>
      {row.gstr3bTable === 'NA' ? (
        <td style={{ color: '#9ca3af', fontWeight: 600 }}>NA</td>
      ) : (
        <td className={styles.bold} style={row.gstr3bTable.length > 5 ? { fontSize: '12px' } : {}}>{row.gstr3bTable}</td>
      )}
      <td className={`${styles.textRight} ${styles.bold}`}>{row.igst.toLocaleString('en-IN')}</td>
      <td className={`${styles.textRight} ${styles.bold}`}>{row.cgst.toLocaleString('en-IN')}</td>
      <td className={`${styles.textRight} ${styles.bold}`}>{row.sgst.toLocaleString('en-IN')}</td>
      <td className={`${styles.textRight} ${styles.bold}`}>{row.cess.toLocaleString('en-IN')}</td>
    </tr>
  );

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>GSTR 2B Details</h1>
      
      <div className={styles.tabsContainer}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Basic' && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Registration Details</h2>
          <p className={styles.cardSubtitle}>Validated GST registration records from the official portal.</p>
          
          <table className={styles.table}>
            <thead>
              <tr>
                <th>FIELD ATTRIBUTE</th>
                <th>RECORDED VALUE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className={styles.fieldLabel}>
                    <div className={styles.iconWrapper}>
                      <IconGSTIN />
                    </div>
                    GSTIN
                  </div>
                </td>
                <td>
                  <div className={styles.valueText}>{data.registrationDetails.gstin}</div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className={styles.fieldLabel}>
                    <div className={styles.iconWrapper}>
                      <IconBuilding />
                    </div>
                    LEGAL NAME OF REGISTERED PERSON
                  </div>
                </td>
                <td>
                  <div className={styles.valueText}>{data.registrationDetails.legalName}</div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className={styles.fieldLabel}>
                    <div className={styles.iconWrapper}>
                      <IconCalendar />
                    </div>
                    YEAR
                  </div>
                </td>
                <td>
                  <div className={styles.valueText}>{data.registrationDetails.year}</div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className={styles.fieldLabel}>
                    <div className={styles.iconWrapper}>
                      <IconCalendar />
                    </div>
                    MONTH
                  </div>
                </td>
                <td>
                  <div className={styles.valueText}>{data.registrationDetails.month}</div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className={styles.fieldLabel}>
                    <div className={styles.iconWrapper}>
                      <IconStore />
                    </div>
                    LEGAL TRADE NAME
                  </div>
                </td>
                <td>
                  <div className={styles.valueText}>{data.registrationDetails.tradeName}</div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className={styles.fieldLabel}>
                    <div className={styles.iconWrapper}>
                      <IconCalendarCheck />
                    </div>
                    DATE OF GENERATION
                  </div>
                </td>
                <td>
                  <div className={styles.valueText}>{data.registrationDetails.generationDate}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'ITC Available' && (
        <>
          <div className={styles.accordion}>
            <div 
              className={styles.accordionHeader} 
              onClick={() => setIsAccordionAExpanded(!isAccordionAExpanded)}
            >
              <div className={styles.accordionIconBox}>A</div>
              <div className={styles.accordionTitle}>ITC Available - Credit may be claimed</div>
              <div className={`${styles.accordionChevron} ${isAccordionAExpanded ? styles.accordionChevronExpanded : ''}`}>
                <IconChevronDown />
              </div>
            </div>
            
            {isAccordionAExpanded && (
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>SECTION</th>
                    <th>HEADING</th>
                    <th>GSTR-3B TABLE</th>
                    <th className={styles.textRight}>IGST (₹)</th>
                    <th className={styles.textRight}>CGST (₹)</th>
                    <th className={styles.textRight}>SGST (₹)</th>
                    <th className={styles.textRight}>CESS (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.itcAvailable.creditMayBeClaimed.map(renderItcRow)}
                </tbody>
              </table>
            )}
          </div>

          <div className={styles.accordion}>
            <div 
              className={styles.accordionHeader} 
              onClick={() => setIsAccordionBExpanded(!isAccordionBExpanded)}
            >
              <div className={styles.accordionIconBox}>B</div>
              <div className={styles.accordionTitle}>ITC Reversal - Credit shall be reversed</div>
              <div className={`${styles.accordionChevron} ${isAccordionBExpanded ? styles.accordionChevronExpanded : ''}`}>
                <IconChevronDown />
              </div>
            </div>
            
            {isAccordionBExpanded && (
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>SECTION</th>
                    <th>HEADING</th>
                    <th>GSTR-3B TABLE</th>
                    <th className={styles.textRight}>IGST (₹)</th>
                    <th className={styles.textRight}>CGST (₹)</th>
                    <th className={styles.textRight}>SGST (₹)</th>
                    <th className={styles.textRight}>CESS (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.itcAvailable.creditShallBeReversed.map(renderItcRow)}
                </tbody>
              </table>
            )}
          </div>

          <div className={styles.confirmContainer}>
            <button className={styles.confirmBtn} onClick={() => setIsFiled(true)}>Confirm Filing</button>
          </div>
        </>
      )}
      {activeTab === 'ITC Inavailable' && (
        <>
          <div className={styles.accordion}>
            <div 
              className={styles.accordionHeader} 
              onClick={() => setIsUnavailableAExpanded(!isUnavailableAExpanded)}
            >
              <div className={styles.accordionIconBox}>A</div>
              <div className={styles.accordionTitle}>ITC Not Available</div>
              <div className={`${styles.accordionChevron} ${isUnavailableAExpanded ? styles.accordionChevronExpanded : ''}`}>
                <IconChevronDown />
              </div>
            </div>
            
            {isUnavailableAExpanded && (
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>SECTION</th>
                    <th>HEADING</th>
                    <th>GSTR-3B TABLE</th>
                    <th className={styles.textRight}>IGST (₹)</th>
                    <th className={styles.textRight}>CGST (₹)</th>
                    <th className={styles.textRight}>SGST (₹)</th>
                    <th className={styles.textRight}>CESS (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.itcUnavailable.itcNotAvailable.map(renderItcRow)}
                </tbody>
              </table>
            )}
          </div>

          <div className={styles.accordion}>
            <div 
              className={styles.accordionHeader} 
              onClick={() => setIsUnavailableBExpanded(!isUnavailableBExpanded)}
            >
              <div className={styles.accordionIconBox}>B</div>
              <div className={styles.accordionTitle}>ITC Reversal</div>
              <div className={`${styles.accordionChevron} ${isUnavailableBExpanded ? styles.accordionChevronExpanded : ''}`}>
                <IconChevronDown />
              </div>
            </div>
            
            {isUnavailableBExpanded && (
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>SECTION</th>
                    <th>HEADING</th>
                    <th>GSTR-3B TABLE</th>
                    <th className={styles.textRight}>IGST (₹)</th>
                    <th className={styles.textRight}>CGST (₹)</th>
                    <th className={styles.textRight}>SGST (₹)</th>
                    <th className={styles.textRight}>CESS (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.itcUnavailable.itcReversal.map(renderItcRow)}
                </tbody>
              </table>
            )}
          </div>

          <div className={styles.confirmContainer}>
            <button className={styles.confirmBtn} onClick={() => setIsFiled(true)}>Confirm Filing</button>
          </div>
        </>
      )}
    </div>
  );
}
