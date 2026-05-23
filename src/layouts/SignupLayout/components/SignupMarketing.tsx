import styles from '@/layouts/SignupLayout/components/SignupMarketing.module.css';

const FEATURES = [
  {
    title: 'Auto-Reconciliation',
    description: 'Smart matching of invoices with GSTR-2A/2B data.',
    icon: 'shield',
  },
  {
    title: 'One-Click Filing',
    description: 'Seamlessly file GSTR-1 and GSTR-3B in seconds.',
    icon: 'chart',
  },
] as const;

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={styles.featureIconSvg}>
      <path
        d="M12 3l7 3v6c0 4.5-3.2 8.7-7 9-3.8-.3-7-4.5-7-9V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 12.5l1.8 1.8 3.7-3.9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={styles.featureIconSvg}>
      <path
        d="M4 19V5M10 19V9M16 19v-6M22 19V3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SignupMarketing() {
  return (
    <section className={styles.section} aria-label="Product overview">
      <p className={styles.eyebrow}>ONBOARDING</p>
      <h1 className={styles.headline}>Automated GST Precision.</h1>
      <p className={styles.description}>
        Advanced reconciliation, seamless filing, and real-time fiscal insights for tax
        professionals.
      </p>

      <div className={styles.cards}>
        {FEATURES.map((feature) => (
          <article key={feature.title} className={styles.card}>
            <div className={styles.cardIcon} aria-hidden>
              {feature.icon === 'shield' ? <ShieldIcon /> : <ChartIcon />}
            </div>
            <h2 className={styles.cardTitle}>{feature.title}</h2>
            <p className={styles.cardText}>{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
