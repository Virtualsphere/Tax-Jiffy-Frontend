import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
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
  const segment = pathname.replace('/dashboard', '').replace(/^\//, '');
  const title = TITLE_MAP[segment] ?? 'Dashboard';

  return (
    <div className={styles.shell}>
      <Sidebar />

      <div className={styles.main}>
        <header className={styles.topbar}>
          <h1 className={styles.topbarTitle}>{title}</h1>
          <div className={styles.topbarActions}>
            <div className={styles.avatar} aria-label="User avatar">JD</div>
          </div>
        </header>

        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
