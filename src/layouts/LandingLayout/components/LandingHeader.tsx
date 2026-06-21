import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { ROUTES } from '@/config/routes';
import styles from '@/layouts/LandingLayout/components/LandingHeader.module.css';

import { authStorage } from '@/features/auth/lib/auth-storage';

const NAV_LINKS = [
  { label: 'Product', href: '/#product' },
  { label: 'Pricing', href: ROUTES.pricing },
  { label: 'Resources', href: ROUTES.resources },
  { label: 'Contact us', href: ROUTES.contact },
];

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuthenticated = !!authStorage.getToken();


  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [menuOpen, closeMenu]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to={ROUTES.home} className={styles.brand}>
          <img src={logo} alt="" className={styles.logo} width={36} height={36} />
          <span className={styles.brandName}>TAXJIFFY</span>
        </Link>

        {/* Desktop nav — hidden on mobile via CSS */}
        <nav className={styles.nav} aria-label="Main">
          <ul className={styles.navList}>
            {NAV_LINKS.map((item) => (
              <li key={item.href}>
                <Link to={item.href} className={styles.navLink}>
                  {item.label}
                </Link>
              </li>
            ))}
            {isAuthenticated ? (
              <li>
                <Link to={ROUTES.dashboard.root} className={styles.cta}>
                  Go to Dashboard
                </Link>
              </li>
            ) : (
              <li style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                <Link to={ROUTES.auth.login} className={styles.navLink}>
                  Sign in
                </Link>
                <Link to={ROUTES.auth.signup} className={styles.cta}>
                  Start free trial
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Hamburger button — visible only on mobile */}
        <button
          type="button"
          className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-drawer"
        >
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
        </button>

        {/* Mobile drawer overlay */}
        {menuOpen && (
          <div className={styles.backdrop} onClick={closeMenu} aria-hidden />
        )}

        {/* Mobile drawer */}
        <div
          id="mobile-drawer"
          className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`}
          aria-hidden={!menuOpen}
        >
          <nav className={styles.drawerNav} aria-label="Mobile navigation">
            <ul className={styles.drawerList}>
              {NAV_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={styles.drawerLink}
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {isAuthenticated ? (
                <li>
                  <Link
                    to={ROUTES.dashboard.root}
                    className={styles.drawerCta}
                    onClick={closeMenu}
                  >
                    Go to Dashboard
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link
                      to={ROUTES.auth.login}
                      className={styles.drawerLink}
                      onClick={closeMenu}
                    >
                      Sign in
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={ROUTES.auth.signup}
                      className={styles.drawerCta}
                      onClick={closeMenu}
                    >
                      Start free trial
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
