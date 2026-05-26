import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import styles from '@/layouts/DashboardLayout/DashboardLayout.module.css';

export function DashboardLayout() {
  return (
    <div className={styles.shell}>
      <Sidebar />

      <div className={styles.main}>
        <header className={styles.topbar}>
          <h1 className={styles.topbarTitle}>Dashboard</h1>
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
