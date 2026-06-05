import styles from './BuiltForSpeedSection.module.css';

function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.iconGreen}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.iconRed}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  );
}

function SyncIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.iconYellow}>
      <polyline points="23 4 23 10 17 10"></polyline>
      <polyline points="1 20 1 14 7 14"></polyline>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
    </svg>
  );
}

export function BuiltForSpeedSection() {
  return (
    <section className={styles.section} aria-labelledby="speed-heading">
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div className={styles.headings}>
            <h2 id="speed-heading" className={styles.titleBlack}>Built for speed.</h2>
            <h2 className={styles.titleGray}>Designed for clarity.</h2>
          </div>
          <div className={styles.textContent}>
            <p className={styles.description}>
              A fast, intuitive interface to review, analyze, and act on GST data without friction. Access every entity from a single pane of glass.
            </p>
            <button className={styles.exploreBtn}>
              Explore product
            </button>
          </div>
        </div>

        <div className={styles.windowCard}>
          <div className={styles.windowHeader}>
            <div className={styles.dots}>
              <span className={styles.dotRed} />
              <span className={styles.dotYellow} />
              <span className={styles.dotGreen} />
            </div>
          </div>
          
          <div className={styles.windowBody}>
            <div className={styles.logHeader}>
              <span className={styles.logTitle}>RECONCILIATION_LOG_0224</span>
              <button className={styles.reconcileBtn}>RECONCILE NOW</button>
            </div>
            
            <div className={styles.logList}>
              <div className={`${styles.logItem} ${styles.logItemSuccess}`}>
                <div className={styles.logItemLeft}>
                  <CheckCircleIcon />
                  <span className={styles.logText}>Purchase INV-9902: Matched with GSTR-2B (Vikas Ent)</span>
                </div>
                <div className={styles.logItemRight}>
                  <span className={styles.amountSuccess}>₹1,24,000</span>
                </div>
              </div>

              <div className={`${styles.logItem} ${styles.logItemDanger}`}>
                <div className={styles.logItemLeft}>
                  <WarningIcon />
                  <span className={styles.logText}>Purchase INV-9904: Mismatch in GSTIN (Zeta Corp)</span>
                </div>
                <div className={styles.logItemRight}>
                  <span className={styles.amountDanger}>₹45,200</span>
                </div>
              </div>

              <div className={`${styles.logItem} ${styles.logItemWarning}`}>
                <div className={styles.logItemLeft}>
                  <SyncIcon />
                  <span className={styles.logText}>Purchase INV-9910: Waiting for supplier upload</span>
                </div>
                <div className={styles.logItemRight}>
                  <span className={styles.amountNeutral}>₹8,900</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
