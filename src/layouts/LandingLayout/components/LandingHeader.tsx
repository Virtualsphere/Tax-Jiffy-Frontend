import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { ROUTES } from '@/config/routes';
import styles from '@/layouts/LandingLayout/components/LandingHeader.module.css';

const NAV_LINKS = [
  { label: 'Product', href: '#product' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Resources', href: '#resources' },
  { label: 'Contact us', href: '#contact' },
] as const;

export function LandingHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to={ROUTES.home} className={styles.brand}>
          <img src={logo} alt="" className={styles.logo} width={36} height={36} />
          <span className={styles.brandName}>TAXJIFFY</span>
        </Link>

        <nav className={styles.nav} aria-label="Main">
          <ul className={styles.navList}>
            {NAV_LINKS.map((item) => (
              <li key={item.href}>
                <a href={item.href} className={styles.navLink}>
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <Link to={ROUTES.auth.login} className={styles.navLink}>
                Sign in
              </Link>
            </li>
          </ul>
          <Link to={ROUTES.auth.signup} className={styles.cta}>
            Start free trial
          </Link>
        </nav>
      </div>
    </header>
  );
}
