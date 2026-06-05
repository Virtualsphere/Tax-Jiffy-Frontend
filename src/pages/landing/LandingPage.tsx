import { HeroSection } from '@/pages/landing/components/HeroSection';
import { PowerfulStatementSection } from '@/pages/landing/components/PowerfulStatementSection';
import { FeaturesSection } from '@/pages/landing/components/FeaturesSection';
import styles from '@/pages/landing/LandingPage.module.css';

export function LandingPage() {
  return (
    <div className={styles.page}>
      <HeroSection />
      <PowerfulStatementSection />
      <FeaturesSection />
    </div>
  );
}
