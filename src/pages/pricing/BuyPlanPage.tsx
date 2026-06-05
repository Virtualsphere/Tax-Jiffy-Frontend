import { Link } from 'react-router-dom';
import styles from './BuyPlanPage.module.css';
import dashboardImg from '@/assets/hero-dashboard.png';

const BadgeCheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const WalletCardsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 4v4" />
    <path d="M9 4v4" />
    <rect width="8" height="4" x="8" y="4" rx="1" />
  </svg>
);

const ClipboardCheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="m9 14 2 2 4-4" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);


export function BuyPlanPage() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <BadgeCheckIcon /> PREMIUM EXPERIENCE
          </div>
          <h1 className={styles.title}>
            Business Plan
            <span className={styles.titleHighlight}>Details</span>
          </h1>
          <p className={styles.subtitle}>
            Powering your growing finance team with advanced automation and compliance tools. Seamlessly handle high volumes of transactions while maintaining ironclad accuracy.
          </p>
        </div>
        <div className={styles.heroImageWrapper}>
          <img src={dashboardImg} alt="Business Dashboard" className={styles.heroImage} />
        </div>
      </div>

      {/* Grid Section */}
      <div className={styles.contentGrid}>
        
        {/* Left Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.pricingCard}>
            <span className={styles.investmentLabel}>INVESTMENT</span>
            <div className={styles.priceWrapper}>
              <span className={styles.price}>₹249</span>
              <span className={styles.priceUnit}>/mo</span>
            </div>
            <span className={styles.billingPeriod}>Billed annually</span>
            <button className={styles.buyButton}>Buy Now</button>
            <div className={styles.secureLabel}>
              <span className={styles.secureIcon}><ShieldIcon /></span>
              Secure Bank-grade encryption
            </div>
          </div>

          <div className={styles.enterpriseCard}>
            <h3 className={styles.enterpriseTitle}>Need more capacity?</h3>
            <p className={styles.enterpriseText}>
              For enterprises managing over 10,000 transactions monthly, our custom solutions offer dedicated account managers.
            </p>
            <Link to="/contact/sales" className={styles.enterpriseLink}>
              Talk to Enterprise &rarr;
            </Link>
          </div>
        </div>

        {/* Right Features Area */}
        <div className={styles.featuresArea}>
          
          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <UsersIcon />
            </div>
            <h3 className={styles.featureTitle}>3 User Team</h3>
            <p className={styles.featureText}>
              Collaborate seamlessly with dedicated logins for your finance head, accountant, and auditor.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <WalletCardsIcon />
            </div>
            <h3 className={styles.featureTitle}>High-Volume Filing</h3>
            <p className={styles.featureText}>
              Includes 400 transactions per month (4,800/yr) with real-time tracking and automated reconciliation.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <ClipboardCheckIcon />
            </div>
            <h3 className={styles.featureTitle}>Advanced Statutory Filing</h3>
            <div className={styles.featureList}>
              <div className={styles.featureListItem}>
                <span className={styles.featureListIcon}><CheckCircleIcon /></span>
                GSTR-1 &amp; GSTR-3B Auto-population
              </div>
              <div className={styles.featureListItem}>
                <span className={styles.featureListIcon}><CheckCircleIcon /></span>
                E-Invoice &amp; E-Way Bill Integration
              </div>
            </div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <ShieldCheckIcon />
            </div>
            <h3 className={styles.featureTitle}>Audit Readiness</h3>
            <div className={styles.featureList}>
              <div className={styles.featureListItem}>
                <span className={styles.featureListIcon}><CheckCircleIcon /></span>
                IMS &amp; Departmental Notices Panel
              </div>
              <div className={styles.featureListItem}>
                <span className={styles.featureListIcon}><CheckCircleIcon /></span>
                Vendor ITC Management &amp; Follow-ups
              </div>
            </div>
          </div>

          <div className={styles.adminCard}>
            <h3 className={styles.adminTitle}>Smart Admin Controls</h3>
            <p className={styles.adminText}>
              Role-based access controls and instant notifications for critical tax deadlines ensure you never miss a compliance requirement.
            </p>
            <svg className={styles.adminBgIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>

        </div>

      </div>
    </div>
  );
}
