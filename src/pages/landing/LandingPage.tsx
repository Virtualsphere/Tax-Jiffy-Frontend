import { HeroSection } from '@/pages/landing/components/HeroSection';
import { PowerfulStatementSection } from '@/pages/landing/components/PowerfulStatementSection';
import { FeaturesSection } from '@/pages/landing/components/FeaturesSection';
import { BuiltForSpeedSection } from '@/pages/landing/components/BuiltForSpeedSection';
import { ReconciliationSection } from '@/pages/landing/components/ReconciliationSection';
import { ComplianceSection } from '@/pages/landing/components/ComplianceSection';
import { IntelligenceSection } from '@/pages/landing/components/IntelligenceSection';
import { TimeSavingSection } from '@/pages/landing/components/TimeSavingSection';
import { CtaSection } from '@/pages/landing/components/CtaSection';
import styles from '@/pages/landing/LandingPage.module.css';

export function LandingPage() {
  return (
    <div className={styles.page}>
      <HeroSection />
      <PowerfulStatementSection />
      <FeaturesSection />
      <BuiltForSpeedSection />
      <ReconciliationSection />
      <ComplianceSection />
      <IntelligenceSection />
      <TimeSavingSection />
      <CtaSection />
    </div>
  );
}
