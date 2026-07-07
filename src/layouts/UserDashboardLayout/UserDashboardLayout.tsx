import { Outlet, Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import styles from '@/layouts/UserDashboardLayout/UserDashboardLayout.module.css';

export function UserDashboardLayout() {
  const { data: user } = useCurrentUser();

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link to={ROUTES.dashboard.user || '/dashboard'} className={styles.brand}>
          <div className={styles.logoText}>
            TAXJIFFY
            <span>USER DASHBOARD</span>
          </div>
        </Link>

        <div className={styles.searchContainer}>
          <svg
            className={styles.searchIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search entities or GSTINs..."
          />
        </div>

        <div className={styles.actions}>
          <button className={styles.connectBtn} onClick={() => {
            // we will handle modal open in the page context or global context.
            // Dispatch an event to open the modal
            window.dispatchEvent(new CustomEvent('open-connect-company-modal'));
          }}>
            Connect New Company
          </button>
          <div className={styles.avatar} aria-label="User avatar" title={user?.name || 'User'}>
            {/* Using a placeholder avatar or initials */}
            {user?.initials || <span role="img" aria-label="user">👤</span>}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
