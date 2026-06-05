import { useState } from 'react';
import { PricingHeroSection } from '@/pages/pricing/components/PricingHeroSection';
import { PricingTiersSection } from '@/pages/pricing/components/PricingTiersSection';
import { PricingComparisonSection } from '@/pages/pricing/components/PricingComparisonSection';
import styles from '@/pages/pricing/PricingPage.module.css';

export function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className={styles.page}>
      <PricingHeroSection isAnnual={isAnnual} onToggleAnnual={setIsAnnual} />
      <PricingTiersSection isAnnual={isAnnual} />
      <PricingComparisonSection isAnnual={isAnnual} />
    </div>
  );
}
