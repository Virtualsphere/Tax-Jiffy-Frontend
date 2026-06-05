import styles from './IntelligenceSection.module.css';

function ChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#6366f1' }}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ef4444' }}>
      <line x1="12" y1="6" x2="12" y2="15" />
      <line x1="12" y1="19" x2="12.01" y2="19" />
    </svg>
  );
}

export function IntelligenceSection() {
  return (
    <section className={styles.section} aria-labelledby="intelligence-heading">
      <div className={styles.headerRow}>
        <div className={styles.headings}>
          <h2 id="intelligence-heading" className={styles.titleBlack}>Know your GST before it<br />becomes a problem</h2>
        </div>
        <div className={styles.textContent}>
          <p className={styles.description}>
            Identify risks, anomalies, and inconsistencies before they turn into notices. Pre-emptive audit tools that monitor every transaction for deviations.
          </p>
          <button className={styles.exploreBtn}>
            See Intelligence
          </button>
        </div>
      </div>

      <div className={styles.windowCard}>
        <div className={styles.cardTopBar}>
          <div className={styles.windowControls}>
            <span className={styles.dotRed}></span>
            <span className={styles.dotYellow}></span>
            <span className={styles.dotGreen}></span>
          </div>
          <div className={styles.windowTitle}>INTELLIGENCE_LAYER_V4</div>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <ChartIcon />
              <span className={styles.cardTitle}>Active Risk Anomalies</span>
            </div>
            <div className={styles.cardBadge}>3 CRITICAL</div>
          </div>

          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>EXPOSURE</div>
              <div className={styles.metricValue}>₹2.4L</div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarFillExposure}></div>
              </div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>HEALTH SCORE</div>
              <div className={styles.metricValueGreen}>94/100</div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarFillHealth}></div>
              </div>
            </div>
          </div>

          <div className={styles.alertBanner}>
            <div className={styles.alertIconWrapper}>
              <AlertIcon />
            </div>
            <div className={styles.alertContent}>
              <div className={styles.alertTitle}>Rule 42/43 Reversal</div>
              <div className={styles.alertSubtitle}>Ratio changed by +15%</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
