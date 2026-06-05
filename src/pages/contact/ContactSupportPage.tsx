import { Link } from 'react-router-dom';
import styles from './ContactSupportPage.module.css';

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function ContactSupportPage() {
  return (
    <div className={styles.container}>
      {/* Left Column */}
      <div className={styles.leftColumn}>
        <h1 className={styles.title}>Contact support</h1>
        <p className={styles.subtitle}>
          Technical issues or product questions? Contact our help desk.
        </p>

        <div className={styles.featureList}>
          <div className={styles.featureItem}>
            <div className={styles.checkIconWrapper}>
              <CheckIcon />
            </div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Submit a ticket</h3>
              <p className={styles.featureDescription}>
                Get a response from our technical support team within 24 hours.
              </p>
            </div>
          </div>

          <div className={styles.featureItem}>
            <div className={styles.checkIconWrapper}>
              <CheckIcon />
            </div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Get help with your account</h3>
              <p className={styles.featureDescription}>
                Resolve billing issues, user permissions, and account access settings.
              </p>
            </div>
          </div>

          <div className={styles.featureItem}>
            <div className={styles.checkIconWrapper}>
              <CheckIcon />
            </div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Find technical documentation</h3>
              <p className={styles.featureDescription}>
                Explore our extensive API guides and integration tutorials.
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
            <label className={styles.label}>TELL US HOW WE CAN HELP</label>
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
