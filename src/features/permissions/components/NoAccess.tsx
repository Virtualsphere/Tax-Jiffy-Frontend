import styles from './NoAccess.module.css';

/** Shown in place of a page the user's role has no View permission on. */
export function NoAccess() {
  return (
    <div className={styles.page} role="alert">
      <h2 className={styles.title}>No access</h2>
      <p className={styles.text}>
        Your role does not include access to this page. Ask your GST admin to grant it in the Role Editor.
      </p>
    </div>
  );
}
