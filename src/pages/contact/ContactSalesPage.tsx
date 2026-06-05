import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import styles from './ContactSalesPage.module.css';

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function ContactSalesPage() {
  return (
    <div className={styles.container}>
      {/* Left Column */}
      <div className={styles.leftColumn}>
        <h1 className={styles.title}>Contact sales</h1>
        <p className={styles.subtitle}>
          Technical issues or product questions?{' '}
          <Link to={ROUTES.contactSupport} className={styles.link}>
            Contact support
          </Link>
        </p>

        <div className={styles.featureList}>
          <div className={styles.featureItem}>
            <div className={styles.checkIconWrapper}>
              <CheckIcon />
            </div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Request a demo</h3>
              <p className={styles.featureDescription}>
                See the platform in action and learn how we can automate your tax compliance.
              </p>
            </div>
          </div>

          <div className={styles.featureItem}>
            <div className={styles.checkIconWrapper}>
              <CheckIcon />
            </div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Learn which plan is right for your team</h3>
              <p className={styles.featureDescription}>
                Custom solutions for enterprises and startups with complex nexus requirements.
              </p>
            </div>
          </div>

          <div className={styles.featureItem}>
            <div className={styles.checkIconWrapper}>
              <CheckIcon />
            </div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Get onboarding help</h3>
              <p className={styles.featureDescription}>
                Dedicated implementation specialists to ensure a smooth migration from legacy systems.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column (Form) */}
      <div className={styles.rightColumn}>
        <form className={styles.formCard} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>FULL NAME</label>
              <input type="text" className={styles.input} placeholder="John Doe" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>WORK EMAIL</label>
              <input type="email" className={styles.input} placeholder="john@company.com" />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>COMPANY SIZE</label>
            <select className={styles.select} defaultValue="">
              <option value="" disabled hidden>Select company size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="501+">501+ employees</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>TELL US ABOUT YOUR REQUIREMENTS</label>
            <textarea 
              className={styles.textarea} 
              placeholder="How can TAXJIFFY help you?"
            ></textarea>
          </div>

          <button type="submit" className={styles.button}>
            Send message
          </button>

          <p className={styles.footerText}>
            By clicking "Send message", you agree to our <Link to="#" className={styles.footerLink}>Terms of Service</Link> and acknowledge our <Link to="#" className={styles.footerLink}>Privacy Policy</Link>. We'll handle your data with precision.
          </p>
        </form>
      </div>
    </div>
  );
}
