import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { UserSidebar } from '@/components/UserSidebar/UserSidebar';
import styles from '@/layouts/UserDashboardLayout/UserDashboardLayout.module.css';

export function UserDashboardLayout() {

  
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);


  return (
    <div className={styles.shell}>
      <UserSidebar mobileOpen={mobileSidebarOpen} onMobileClose={closeMobileSidebar} />
      
      <div className={styles.main}>

        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
