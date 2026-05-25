import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import styles from '@/pages/errors/ErrorPage.module.css';

export function ErrorPage() {
  const error = useRouteError();

  let title = 'Something went wrong';
  let message = 'An unexpected error occurred. Please try again.';

  if (isRouteErrorResponse(error)) {
    title = `${error.status}`;
    message = error.statusText || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.code}>{title}</h1>
      <p className={styles.message}>{message}</p>
      <Link className={styles.link} to={ROUTES.home}>
        Back to home
      </Link>
    </main>
  );
}
