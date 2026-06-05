import styles from './ReconciliationSection.module.css';

function BadgeCheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#10b981' }}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function EngineIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function BrokenLinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="15" y1="9" x2="9" y2="15" />
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export function ReconciliationSection() {
  return (
    <section className={styles.section} aria-labelledby="reconciliation-heading">
      <div className={styles.headerRow}>
        <div className={styles.headings}>
          <h2 id="reconciliation-heading" className={styles.titleBlack}>Reconciliation that actually<br />works</h2>
        </div>
        <div className={styles.textContent}>
          <p className={styles.description}>
            Automatically match invoices with GST data and focus only on mismatches that need action. High precision matching engine for modern teams.
          </p>
          <button className={styles.exploreBtn}>
            Try reconciliation
          </button>
        </div>
      </div>

      <div className={styles.cardContainer}>
        <div className={styles.floatingBadge}>
          <BadgeCheckIcon />
          <span>99.2% Accuracy</span>
        </div>

        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <div className={styles.engineIconBox}>
              <EngineIcon />
            </div>
            <div className={styles.engineTitles}>
              <span className={styles.engineName}>Matching Engine</span>
              <span className={styles.engineVersion}>V2.4_ALGORITHM_ACTIVE</span>
            </div>
          </div>
          <div className={styles.avatars}>
            <div className={`${styles.avatar} ${styles.avatarBlue}`}>G</div>
            <div className={`${styles.avatar} ${styles.avatarGreen}`}>P</div>
            <div className={`${styles.avatar} ${styles.avatarGray}`}>+</div>
          </div>
        </div>

        <div className={styles.list}>
          <div className={styles.listItem}>
            <div className={styles.itemContent}>
              <div className={styles.itemLeft}>
                <div className={`${styles.itemIcon} ${styles.iconGreen}`}>
                  <LinkIcon />
                </div>
                <span className={styles.itemName}>Inv #88219 (Office Supplies)</span>
              </div>
              <span className={`${styles.itemStatus} ${styles.statusGreen}`}>MATCHED</span>
            </div>
            <div className={styles.progressTrack}>
              <div className={`${styles.progressFill} ${styles.bgGreen}`} style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className={styles.listItem}>
            <div className={styles.itemContent}>
              <div className={styles.itemLeft}>
                <div className={`${styles.itemIcon} ${styles.iconBlue}`}>
                  <LinkIcon />
                </div>
                <span className={styles.itemName}>Inv #88220 (IT Services)</span>
              </div>
              <span className={`${styles.itemStatus} ${styles.statusBlue}`}>MATCHED</span>
            </div>
            <div className={styles.progressTrack}>
              <div className={`${styles.progressFill} ${styles.bgBlue}`} style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className={styles.listItem}>
            <div className={styles.itemContent}>
              <div className={styles.itemLeft}>
                <div className={`${styles.itemIcon} ${styles.iconGray}`}>
                  <BrokenLinkIcon />
                </div>
                <span className={styles.itemNameMuted}>Inv #88221 (Marketing)</span>
              </div>
              <span className={`${styles.itemStatus} ${styles.statusRed}`}>ACTION REQUIRED</span>
            </div>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: '0%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
