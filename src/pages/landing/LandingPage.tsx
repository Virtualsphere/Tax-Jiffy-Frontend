import { HeroSection } from '@/pages/landing/components/HeroSection';
import { PowerfulStatementSection } from '@/pages/landing/components/PowerfulStatementSection';
import styles from '@/pages/landing/LandingPage.module.css';

export function LandingPage() {
  return (
    <div className={styles.page}>
      <HeroSection />
      <PowerfulStatementSection />
    </div>
  );
}
