import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hamburger from 'hamburger-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { authStorage } from '@/features/auth/lib/auth-storage';
import { ROUTES } from '@/config/routes';
import logo from '@/assets/logo-icon.png';

import styles from './UserSidebar.module.css';

export type UserSidebarProps = {
  defaultCollapsed?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

export function UserSidebar({
  defaultCollapsed = false,
  mobileOpen = false,
  onMobileClose,
}: UserSidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    authStorage.clearToken();
    navigate(ROUTES.home);
  };

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}
      aria-label="User navigation"
    >
      <div className={styles.header}>
        <div className={styles.brand}>
          <img src={logo} alt="" className={styles.logo} width={36} height={36} />
          <span className={styles.brandName}>TAXJIFFY</span>
        </div>
        <div className={styles.collapseBtn}>
          <Hamburger
            toggled={!collapsed}
            toggle={toggleCollapsed}
            size={20}
          />
        </div>
      </div>

      <nav className={styles.nav} aria-label="User actions">
        <ul className={styles.navList}>
          <li className={styles.navSection}>
            <button
              className={styles.addGstBtn}
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-add-new-gstin-modal'));
                onMobileClose?.();
              }}
              title={collapsed ? 'Add New GSTIN' : undefined}
            >
              <span className={styles.addGstIcon}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </span>
              {!collapsed && (
                <span className={styles.addGstLabel}>
                  Add New GSTIN
                </span>
              )}
            </button>
          </li>
        </ul>
      </nav>

      <div className={styles.userProfile}>
        <div className={styles.avatar} aria-label="User avatar" title={user?.name || 'User'}>
          {user?.initials || <span role="img" aria-label="user">👤</span>}
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user?.name || 'User'}</span>
          <span className={styles.userEmail}>{user?.email || 'user@example.com'}</span>
        </div>
        <button onClick={handleLogout} className={styles.logoutButton} title="Logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </aside>
  );
}
