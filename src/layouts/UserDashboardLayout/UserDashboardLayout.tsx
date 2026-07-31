import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { authStorage } from '@/features/auth/lib/auth-storage';
import styles from '@/layouts/UserDashboardLayout/UserDashboardLayout.module.css';

export function UserDashboardLayout() {
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    authStorage.clearToken();
    navigate(ROUTES.home);
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link to={ROUTES.dashboard.companies || '/dashboard'} className={styles.brand}>
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
          <div 
            ref={dropdownRef}
            style={{ position: 'relative' }}
          >
            <div 
              className={styles.avatar} 
              aria-label="User avatar" 
              title={user?.name || 'User'}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {/* Using a placeholder avatar or initials */}
              {user?.initials || <span role="img" aria-label="user">👤</span>}
            </div>
            
            {isDropdownOpen && (
              <div 
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  minWidth: '180px',
                  zIndex: 50,
                  padding: '4px'
                }}
              >
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>{user?.name || 'User'}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'user@example.com'}</div>
                </div>
                <button 
                  onClick={handleLogout}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#ef4444',
                    borderRadius: '4px',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
