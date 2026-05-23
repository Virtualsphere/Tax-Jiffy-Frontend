import { Outlet } from 'react-router-dom';
import { SignupMarketing } from '@/layouts/SignupLayout/components/SignupMarketing';
import styles from '@/layouts/SignupLayout/SignupLayout.module.css';

export function SignupLayout() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <SignupMarketing />
        <div className={styles.formColumn}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
