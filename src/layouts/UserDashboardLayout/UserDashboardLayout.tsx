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
        <header className={styles.header}>
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
        </header>

        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
