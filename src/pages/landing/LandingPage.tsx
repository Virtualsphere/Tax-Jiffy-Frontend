import { HeroSection } from '@/pages/landing/components/HeroSection';
import styles from '@/pages/landing/LandingPage.module.css';

export function LandingPage() {
  return (
    <div className={styles.page}>
      <HeroSection />
    </div>
  );
}
