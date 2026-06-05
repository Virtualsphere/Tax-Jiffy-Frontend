import styles from './ResourcesPage.module.css';

const SwapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 10H3" />
    <path d="m6 7-3 3 3 3" />
    <path d="M7 14h14" />
    <path d="m18 11 3 3-3 3" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export function ResourcesPage() {
  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <h1 className={styles.title}>
          Something <span className={styles.highlight}>powerful</span> is<br />arriving.
        </h1>
        <p className={styles.subtitle}>
          The most advanced GST system for growing teams is almost here.<br />
          Join our exclusive waitlist for early access to the future of financial<br />
          compliance.
        </p>
      </div>

      <div className={styles.formSection}>
        <form className={styles.formWrapper} onSubmit={(e) => e.preventDefault()}>
          <input 
            type="email" 
            className={styles.input} 
            placeholder="Enter your business email" 
            required 
          />
          <button type="submit" className={styles.button}>
            Join<br />Waitlist
          </button>
        </form>
        <div className={styles.disclaimer}>
          No credit card required. Early bird pricing for first 500 members.
        </div>
      </div>

      <div className={styles.cardsContainer}>
        {/* Card 1 */}
        <div className={`${styles.card} ${styles.cardPrimary}`}>
          <div className={styles.iconWrapper}>
            <SwapIcon />
          </div>
          <h3 className={styles.cardTitle}>Automated<br />Reconciliation</h3>
          <p className={styles.cardDescription}>
            Smart matching engine that reconciles GSTR-2B with purchase registers in seconds.
          </p>
        </div>

        {/* Card 2 */}
        <div className={`${styles.card} ${styles.cardSecondary}`}>
          <div className={styles.iconWrapper}>
            <SparklesIcon />
          </div>
          <h3 className={styles.cardTitle}>AI-Powered Returns</h3>
          <p className={styles.cardDescription}>
            Predictive filing and error detection before you hit submit.<br />Built for precision.
          </p>
        </div>

        {/* Card 3 */}
        <div className={`${styles.card} ${styles.cardPrimary}`}>
          <div className={styles.iconWrapper}>
            <ShieldCheckIcon />
          </div>
          <h3 className={styles.cardTitle}>Enterprise Security</h3>
          <p className={styles.cardDescription}>
            Bank-grade encryption and multi-factor authentication for total data sovereignty.
          </p>
        </div>
      </div>
    </div>
  );
}
