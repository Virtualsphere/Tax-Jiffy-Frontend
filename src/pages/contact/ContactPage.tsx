import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import styles from './ContactPage.module.css';

const BanknoteIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);

const HelpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    <path d="M12 16h.01" />
    <path d="M12 8a2.5 2.5 0 0 0-1.5 4.5V13" />
  </svg>
);

export function ContactPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div className={styles.eyebrow}>Connect with us</div>
        <h1 className={styles.title}>How can we help?</h1>
        <p className={styles.subtitle}>
          Get in touch with our sales and support teams for demos, onboarding support, or product questions.
        </p>
      </div>

      <div className={styles.cardsContainer}>
        {/* Sales Card */}
        <div className={styles.card}>
          <div className={styles.iconWrapper}>
            <BanknoteIcon />
          </div>
          <h2 className={styles.cardTitle}>Sales</h2>
          <p className={styles.cardDescription}>
            Speak to our sales team about plans, pricing, enterprise contracts, or request a demo.
          </p>
          <button className={styles.button} onClick={() => navigate(ROUTES.contactSales)}>
            Talk to sales
          </button>
        </div>

        {/* Support Card */}
        <div className={styles.card}>
          <div className={styles.iconWrapper}>
            <HelpIcon />
          </div>
          <h2 className={styles.cardTitle}>Help &amp; support</h2>
          <p className={styles.cardDescription}>
            Ask product questions, report problems, or leave feedback.
          </p>
          <button className={styles.button} onClick={() => navigate(ROUTES.contactSupport)}>
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
