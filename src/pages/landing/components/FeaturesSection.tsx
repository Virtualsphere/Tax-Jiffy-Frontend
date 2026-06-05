import styles from '@/pages/landing/components/FeaturesSection.module.css';

import featureAutomateImg from '@/assets/feature-automate.jpg';
import featureDecisionsImg from '@/assets/feature-decisions.jpg';
import featureCompliantImg from '@/assets/feature-compliant.png';

export function FeaturesSection() {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {/* Card 1: Automate work */}
        <div className={styles.card}>
          <div className={styles.illustrationWrapper}>
            <img src={featureAutomateImg} alt="Stack of layers" className={styles.illustration} />
          </div>
          <div className={styles.content}>
            <div className={styles.iconWrapper} style={{ color: '#6366f1', backgroundColor: '#eef2ff' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21v-5h5" />
              </svg>
            </div>
            <h3 className={styles.cardTitle}>Automate work</h3>
            <p className={styles.cardDescription}>
              Automate purchase register ingestion, vendor communications, and monthly GSTR-2B matching protocols.
            </p>
          </div>
        </div>

        {/* Card 2: Turn data into decisions */}
        <div className={styles.card}>
          <div className={styles.illustrationWrapper}>
            <img src={featureDecisionsImg} alt="Cluster of blocks" className={styles.illustration} />
          </div>
          <div className={styles.content}>
            <div className={styles.iconWrapper} style={{ color: '#10b981', backgroundColor: '#ecfdf5' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </div>
            <h3 className={styles.cardTitle}>Turn data into decisions</h3>
            <p className={styles.cardDescription}>
              Visualize your tax liability and input tax credit in real-time. Predict cash flows with AI-driven tax forecasting.
            </p>
          </div>
        </div>

        {/* Card 3: Stay compliant */}
        <div className={styles.card}>
          <div className={styles.illustrationWrapper}>
            <img src={featureCompliantImg} alt="Stack of angled planes" className={styles.illustration} />
          </div>
          <div className={styles.content}>
            <div className={styles.iconWrapper} style={{ color: '#f59e0b', backgroundColor: '#fffbeb' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h3 className={styles.cardTitle}>Stay compliant</h3>
            <p className={styles.cardDescription}>
              Built-in audit trails and automated compliance checks ensure you never miss a deadline or a validation rule.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
