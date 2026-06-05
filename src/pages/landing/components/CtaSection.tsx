import styles from './CtaSection.module.css';

export function CtaSection() {
  return (
    <section className={styles.section} aria-labelledby="cta-heading">
      <div className={styles.card}>
        <div className={styles.content}>
          <h2 id="cta-heading" className={styles.title}>
            GST compliance shouldn’t<br />slow you down.
          </h2>
          <p className={styles.description}>
            Join 2,000+ growing teams using TAXJIFFY to automate their tax workflow.<br />
            Get started in less than 5 minutes.
          </p>
          <div className={styles.actions}>
            <button className={styles.primaryBtn}>Get started for free</button>
            <button className={styles.secondaryBtn}>Talk to Sales</button>
          </div>
          <p className={styles.disclaimer}>
            No credit card required. 14-day free trial.
          </p>
        </div>
      </div>
    </section>
  );
}
