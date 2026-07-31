import React from 'react';
import { HeroSection } from '@/pages/landing/components/HeroSection';
import { PowerfulStatementSection } from '@/pages/landing/components/PowerfulStatementSection';
import { FeaturesSection } from '@/pages/landing/components/FeaturesSection';
import { BuiltForSpeedSection } from '@/pages/landing/components/BuiltForSpeedSection';
import { ReconciliationSection } from '@/pages/landing/components/ReconciliationSection';
import { ComplianceSection } from '@/pages/landing/components/ComplianceSection';
import { IntelligenceSection } from '@/pages/landing/components/IntelligenceSection';
import { TimeSavingSection } from '@/pages/landing/components/TimeSavingSection';
import { CtaSection } from '@/pages/landing/components/CtaSection';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import styles from '@/pages/landing/LandingPage.module.css';

function RevealSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  return (
    <div
      ref={ref}
      className={`${styles.reveal} ${isVisible ? styles.revealVisible : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function LandingPage() {
  return (
    <div className={styles.page}>
      <HeroSection />
      <RevealSection>
        <PowerfulStatementSection />
      </RevealSection>
      <RevealSection delay={50}>
        <FeaturesSection />
      </RevealSection>
      <RevealSection delay={50}>
        <BuiltForSpeedSection />
      </RevealSection>
      <RevealSection>
        <ReconciliationSection />
      </RevealSection>
      <RevealSection delay={50}>
        <ComplianceSection />
      </RevealSection>
      <RevealSection>
        <IntelligenceSection />
      </RevealSection>
      <RevealSection delay={50}>
        <TimeSavingSection />
      </RevealSection>
      <RevealSection>
        <CtaSection />
      </RevealSection>
    </div>
  );
}
