import styles from './TimeSavingSection.module.css';

function LightningIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
  );
}


function SmallCheckCircle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#10b981' }}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}

export function TimeSavingSection() {
  return (
    <section className={styles.section} aria-labelledby="time-saving-heading">
      <div className={styles.headerRow}>
        <div className={styles.headings}>
          <h2 id="time-saving-heading" className={styles.titleBlack}>Hours of work.<br />Done in minutes.</h2>
        </div>
        <div className={styles.textContent}>
          <p className={styles.description}>
            Replace Excel workflows with automation that scales with your business. Achieve 95% reduction in manual entry time.
          </p>
          <button className={styles.exploreBtn}>
            Start saving time
          </button>
        </div>
      </div>

      <div className={styles.cardContainer}>
        <div className={styles.cardTopBar}>
          <div className={styles.cardTopLeft}>
            <div className={styles.iconCircle}>
              <LightningIcon />
            </div>
            <span className={styles.automationTitle}>TAXJIFFY Automation</span>
          </div>
          <div className={styles.successBadge}>
            SUCCESS
          </div>
        </div>

        <div className={styles.cardContent}>
          <div className={styles.statusLabel}>RECONCILIATION STATUS</div>
          
          <div className={styles.mainContentRow}>
            <h3 className={styles.mainTitle}>100% Matched</h3>
            <div className={styles.verifiedIconWrapper}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#5e6ad2' }}>
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                <path d="m9 12 2 2 4-4"></path>
                <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10A10 10 0 0 1 2 12 10 10 0 0 1 12 2m0-2a12 12 0 1 0 0 24 12 12 0 0 0 0-24z" stroke="none" fill="#5e6ad2" fillOpacity="0.1"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" fill="none" />
              </svg>
            </div>
          </div>

          <div className={styles.progressBar}>
            <div className={styles.progressFill}></div>
          </div>

          <div className={styles.cardFooter}>
            <SmallCheckCircle />
            <span className={styles.footerText}>4,129 Invoices Processed in 12s</span>
          </div>
        </div>
      </div>
    </section>
  );
}
