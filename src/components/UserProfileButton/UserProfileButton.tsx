import { Link, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { authStorage } from '@/features/auth/lib/auth-storage';
import { ROUTES } from '@/config/routes';

import styles from './UserProfileButton.module.css';

export function UserProfileButton() {
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    authStorage.clearToken();
    navigate(ROUTES.home);
  };

  const name = user?.name || 'User';

  return (
    <div className={styles.root}>
      <Link to={ROUTES.dashboard.profile} className={styles.profileLink} title="View profile">
        <span className={styles.avatar}>
          {user?.initials || <span role="img" aria-label="user">👤</span>}
        </span>
        <span className={styles.userInfo}>
          <span className={styles.userName}>{name}</span>
          <span className={styles.userEmail}>{user?.email || 'user@example.com'}</span>
        </span>
        <svg className={styles.chevron} width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
      <button type="button" onClick={handleLogout} className={styles.logoutButton} title="Logout" aria-label="Logout">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      </button>
    </div>
  );
}
