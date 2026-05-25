import styles from '@/pages/landing/components/PowerfulStatementSection.module.css';

export function PowerfulStatementSection() {
  return (
    <div className={styles.band}>
      <section className={styles.section} aria-labelledby="statement-heading">
        <h2 id="statement-heading" className={styles.heading}>
          A new way to run GST.
        </h2>
        <p className={styles.description}>
          Designed for modern finance teams who value speed, accuracy, and clarity. No more
          spreadsheets, no more manual matching.
        </p>
      </section>
    </div>
  );
}
