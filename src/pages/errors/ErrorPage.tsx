import { useEffect, useState } from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import styles from '@/pages/errors/ErrorPage.module.css';

// Vite/browsers throw this when a lazy-loaded chunk 404s — typically because
// a new deploy replaced the hashed asset files this tab's index.html still
// references. A single reload picks up the fresh index.html + hashes.
const CHUNK_LOAD_ERROR_PATTERN =
  /fetch dynamically imported module|error loading dynamically imported module|importing a module script failed/i;
const RELOAD_TIMESTAMP_KEY = 'chunk-reload-attempted-at';
const RELOAD_COOLDOWN_MS = 10_000;

export function ErrorPage() {
  const error = useRouteError();
  const [reloading, setReloading] = useState(false);

  let title = 'Something went wrong';
  let message = 'An unexpected error occurred. Please try again.';
  let isChunkLoadError = false;

  if (isRouteErrorResponse(error)) {
    title = `${error.status}`;
    message = error.statusText || message;
  } else if (error instanceof Error) {
    message = error.message;
    isChunkLoadError = CHUNK_LOAD_ERROR_PATTERN.test(error.message);
  }

  useEffect(() => {
    if (!isChunkLoadError) return;

    const lastAttempt = Number(sessionStorage.getItem(RELOAD_TIMESTAMP_KEY) ?? 0);
    const withinCooldown = Date.now() - lastAttempt < RELOAD_COOLDOWN_MS;

    if (!withinCooldown) {
      sessionStorage.setItem(RELOAD_TIMESTAMP_KEY, String(Date.now()));
      setReloading(true);
      window.location.reload();
    }
  }, [isChunkLoadError]);

  if (reloading) {
    return null;
  }

  if (isChunkLoadError) {
    title = 'Update available';
    message = 'A new version of the app was deployed. Please reload to continue.';
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.code}>{title}</h1>
      <p className={styles.message}>{message}</p>
      {isChunkLoadError ? (
        <button className={styles.link} onClick={() => window.location.reload()}>
          Reload page
        </button>
      ) : (
        <Link className={styles.link} to={ROUTES.home}>
          Back to home
        </Link>
      )}
    </main>
  );
}
