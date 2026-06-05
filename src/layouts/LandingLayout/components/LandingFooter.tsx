import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import styles from '@/layouts/LandingLayout/components/LandingFooter.module.css';

const FOOTER_LINKS = {
  product: [
    { label: 'Features', href: '#' },
    { label: 'Product Preview', href: '#' },
    { label: 'Reconciliation', href: '#' },
    { label: 'Compliance', href: '#' },
    { label: 'Intelligence', href: '#' },
    { label: 'Time Saving', href: '#' },
    { label: 'Use Case', href: '#' },
  ],
  pricing: [
    { label: 'Free', href: '/pricing' },
    { label: 'Basic', href: '/pricing' },
    { label: 'Business', href: '/pricing' },
    { label: 'Enterprise', href: '/pricing' },
  ],
  contact: [
    { label: 'Sales', href: '#' },
    { label: 'Technical Support', href: '#' },
  ],
};

export function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        
        {/* Left Section - Brand */}
        <div className={styles.brandSection}>
          <Link to="/" className={styles.brand}>
            <img src={logo} alt="TaxJiffy Logo" className={styles.logo} width={28} height={28} />
            <span className={styles.brandName}>TAXJIFFY</span>
          </Link>
          <div className={styles.brandTagline}>
            <p>Modernizing tax compliance for growing teams.</p>
            <p>Built for speed, precision, and clarity.</p>
          </div>
          
          <div className={styles.copyright}>
            &copy; 2024 TAXJIFFY. Precision in every calculation.
          </div>
        </div>

        {/* Right Section - Links */}
        <div className={styles.linksSection}>
          
          <div className={styles.column}>
            <h4 className={styles.columnHeader}>PRODUCT</h4>
            <ul className={styles.linkList}>
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className={styles.link}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnHeader}>PRICING</h4>
            <ul className={styles.linkList}>
              {FOOTER_LINKS.pricing.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className={styles.link}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnHeader}>CONTACT</h4>
            <ul className={styles.linkList}>
              {FOOTER_LINKS.contact.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className={styles.link}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
}
