import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { useCurrentEntity } from '@/hooks/useCurrentEntity';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { authStorage } from '@/features/auth/lib/auth-storage';
import { ROUTES } from '@/config/routes';
import styles from '@/layouts/DashboardLayout/DashboardLayout.module.css';

/** Map route segments to human-readable page titles */
const TITLE_MAP: Record<string, string> = {
  '': 'Dashboard',
  'sale-register': 'Sale Register',
  'gstr-1': 'GSTR-1 Filing',
  'gstr-1a': 'GSTR-1A',
  'purchase-register': 'Purchase Register',
  ims: 'IMS',
  'gstr-2a': 'GSTR-2A',
  'gstr-2b': 'GSTR-2B',
  'itc-03': 'ITC-03',
  'itc-04': 'ITC-04',
  'e-invoice': 'E-Invoice',
  'e-way-bill': 'E-Way Bill',
  'gstr-3b': 'GSTR-3B',
  'gstr-9': 'GSTR-9',
  'gstr-9c': 'GSTR-9C',
  'gst-ledgers': 'GST Ledgers',
  'vendor-ledger': 'Vendor Ledger',
  challan: 'Challan',
};

export function DashboardLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const segment = pathname.replace('/dashboard', '').replace(/^\//, '');
  const title = TITLE_MAP[segment] ?? 'Dashboard';

  const { data: entity } = useCurrentEntity();
  const { data: user } = useCurrentUser();

  const handleLogout = () => {
    authStorage.clearToken();
    navigate(ROUTES.home);
  };

  return (
    <div className={styles.shell}>
      <Sidebar entity={entity} />

      <div className={styles.main}>
        <header className={styles.topbar}>
          <h1 className={styles.topbarTitle}>{title}</h1>
          <div className={styles.topbarActions}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className={styles.avatar} aria-label="User avatar" title={user.name}>{user.initials}</div>
              <button onClick={handleLogout} className={styles.logoutButton} style={{
                background: 'none',
                border: '1px solid #e2e8f0',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#64748b',
                fontWeight: 500,
                fontSize: '14px'
              }}>
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

