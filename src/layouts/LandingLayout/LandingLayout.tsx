import { Outlet } from 'react-router-dom';
import { LandingHeader } from '@/layouts/LandingLayout/components/LandingHeader';
import { LandingFooter } from '@/layouts/LandingLayout/components/LandingFooter';
import styles from '@/layouts/LandingLayout/LandingLayout.module.css';

export function LandingLayout() {
  return (
    <div className={styles.shell}>
      <LandingHeader />
      <main className={styles.main}>
        <Outlet />
      </main>
      <LandingFooter />
    </div>
  );
}
