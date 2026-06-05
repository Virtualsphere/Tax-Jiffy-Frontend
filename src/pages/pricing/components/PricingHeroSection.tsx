import styles from '@/pages/pricing/components/PricingHeroSection.module.css';

interface PricingHeroSectionProps {
  isAnnual: boolean;
  onToggleAnnual: (isAnnual: boolean) => void;
}

export function PricingHeroSection({ isAnnual, onToggleAnnual }: PricingHeroSectionProps) {
  return (
    <section className={styles.heroSection}>
      <h1 className={styles.title}>Simple pricing. Real value.</h1>
      <p className={styles.subtitle}>
        Pay for outcomes—not complexity. Transparent tiers designed for high-performance finance teams.
      </p>

      <div className={styles.toggleContainer}>
        <span className={`${styles.toggleLabel} ${!isAnnual ? styles.activeLabel : ''}`}>Monthly</span>
        <button
          type="button"
          className={`${styles.toggleSwitch} ${isAnnual ? styles.active : ''}`}
          onClick={() => onToggleAnnual(!isAnnual)}
          aria-pressed={isAnnual}
          aria-label="Toggle annual billing"
        >
          <span className={styles.toggleKnob} />
        </button>
        <span className={`${styles.toggleLabel} ${isAnnual ? styles.activeLabel : ''}`}>Annually</span>
        <span className={styles.saveBadge}>SAVE 20%</span>
      </div>
    </section>
  );
}
