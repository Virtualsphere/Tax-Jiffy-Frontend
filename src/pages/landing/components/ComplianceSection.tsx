import styles from './ComplianceSection.module.css';

function DocumentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#6366f1' }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#10b981' }}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export function ComplianceSection() {
  return (
    <section className={styles.section} aria-labelledby="compliance-heading">
      <div className={styles.headerRow}>
        <div className={styles.headings}>
          <h2 id="compliance-heading" className={styles.titleBlack}>File returns without<br />second-guessing</h2>
        </div>
        <div className={styles.textContent}>
          <p className={styles.description}>
            Prepare accurate GSTR-1 and 3B data with built-in validation and structured workflows. Eliminate filing errors before they happen.
          </p>
          <button className={styles.exploreBtn}>
            View compliance tools
          </button>
        </div>
      </div>

      <div className={styles.windowCard}>
        <div className={styles.cardTopBar}>
          <div className={styles.cardTopBarLeft}>
            <DocumentIcon />
            <span className={styles.cardTitle}>GSTR-3B Summary — February 2024</span>
          </div>
          <div className={styles.cardBadge}>SYSTEM VALIDATED</div>
        </div>

        <div className={`${styles.tableGrid} ${styles.tableHeader}`}>
          <div className={styles.headerCell}>SECTION</div>
          <div className={`${styles.headerCell} ${styles.alignRight}`}>TAX AMOUNT</div>
          <div className={`${styles.headerCell} ${styles.alignCenter}`}>STATUS</div>
        </div>

        <div className={`${styles.tableGrid} ${styles.tableRow}`}>
          <div className={styles.rowSection}>3.1 Outward Taxable Supplies</div>
          <div className={`${styles.rowAmount} ${styles.alignRight}`}>₹22,32,000</div>
          <div className={`${styles.rowStatus} ${styles.alignCenter}`}><CheckCircleIcon /></div>
        </div>

        <div className={`${styles.tableGrid} ${styles.tableRow}`}>
          <div className={styles.rowSection}>4 Eligible ITC</div>
          <div className={`${styles.rowAmount} ${styles.alignRight}`}>₹18,45,200</div>
          <div className={`${styles.rowStatus} ${styles.alignCenter}`}><CheckCircleIcon /></div>
        </div>

        <div className={`${styles.tableGrid} ${styles.tableRow} ${styles.noBorder}`}>
          <div className={styles.rowSection}>5 Exempt/Nil Rated</div>
          <div className={`${styles.rowAmount} ${styles.alignRight}`}>₹0</div>
          <div className={`${styles.rowStatus} ${styles.alignCenter}`}><CheckCircleIcon /></div>
        </div>

        <div className={styles.cardFooter}>
          <div className={styles.footerLeft}>
            <span className={styles.statusDot} />
            <span className={styles.footerStatusText}>Ready for e-filing</span>
          </div>
          <button className={styles.generateBtn}>Generate JSON</button>
        </div>
      </div>
    </section>
  );
}
