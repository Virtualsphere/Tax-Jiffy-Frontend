import { useState, useCallback, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { useCurrentEntity } from '@/hooks/useCurrentEntity';

import styles from '@/layouts/DashboardLayout/DashboardLayout.module.css';

/** Map route segments to human-readable page titles */
const TITLE_MAP: Record<string, string> = {
  '': 'Dashboard',
  users: 'User Management',
  roles: 'Roles',
  billing: 'Billing',
  'subscription-plans': 'Subscription Plans',
  'sale-register': 'Sale Register',
  'gstr-1': 'GSTR-1',
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

  const segment = pathname.replace('/dashboard', '').replace(/^\//, '');
  const title = TITLE_MAP[segment] ?? 'Dashboard';

  const { data: entity } = useCurrentEntity();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);

  // Close sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileSidebarOpen]);


  return (
    <div className={styles.shell}>
      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div className={styles.backdrop} onClick={closeMobileSidebar} aria-hidden />
      )}

      <Sidebar entity={entity} mobileOpen={mobileSidebarOpen} onMobileClose={closeMobileSidebar} />

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              type="button"
              className={styles.mobileMenuBtn}
              onClick={() => setMobileSidebarOpen((prev) => !prev)}
              aria-label={mobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.contentInner}>
            <h1 className={styles.pageHeading}>{title}</h1>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

