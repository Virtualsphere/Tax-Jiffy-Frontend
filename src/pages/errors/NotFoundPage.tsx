import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import styles from '@/pages/errors/NotFoundPage.module.css';

export function NotFoundPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.code}>404</h1>
      <p className={styles.message}>Page not found</p>
      <Link className={styles.link} to={ROUTES.home}>
        Back to home
      </Link>
    </main>
  );
}
