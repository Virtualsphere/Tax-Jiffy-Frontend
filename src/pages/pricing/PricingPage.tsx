import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PricingHeroSection } from '@/pages/pricing/components/PricingHeroSection';
import { PricingTiersSection } from '@/pages/pricing/components/PricingTiersSection';
import { PricingComparisonSection } from '@/pages/pricing/components/PricingComparisonSection';
import styles from '@/pages/pricing/PricingPage.module.css';

export function PricingPage() {
  const [searchParams] = useSearchParams();
  const gstId = searchParams.get('gstId') ? Number(searchParams.get('gstId')) : undefined;
  const companyId = searchParams.get('companyId') ? Number(searchParams.get('companyId')) : undefined;
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className={styles.page}>
      <PricingHeroSection isAnnual={isAnnual} onToggleAnnual={setIsAnnual} />
      <PricingTiersSection isAnnual={isAnnual} gstId={gstId} companyId={companyId} />
      <PricingComparisonSection isAnnual={isAnnual} />
    </div>
  );
}
