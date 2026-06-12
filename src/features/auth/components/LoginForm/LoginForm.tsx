import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useLogin } from '@/features/auth/hooks/useLogin';
import styles from '@/features/auth/components/LoginForm/LoginForm.module.css';

export function LoginForm() {
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <div className={styles.card}>
      <header className={styles.header}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>
          Sign in to manage your automated GST compliance.
        </p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="login-email">
            EMAIL ADDRESS
          </label>
          <div className={styles.inputWrap}>
            <input
              id="login-email"
              name="email"
              type="email"
              className={styles.input}
              placeholder="name@company.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.label} htmlFor="login-password">
              PASSWORD
            </label>
            <Link to={ROUTES.auth.forgotPassword} className={styles.forgotLink}>
              Forgot Password?
            </Link>
          </div>
          <div className={styles.inputWrap}>
            <input
              id="login-password"
              name="password"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.checkboxRow}>
          <input
            id="login-remember"
            name="remember"
            type="checkbox"
            className={styles.checkbox}
            checked={keepLoggedIn}
            onChange={(e) => setKeepLoggedIn(e.target.checked)}
          />
          <label className={styles.checkboxLabel} htmlFor="login-remember">
            Keep me logged in for 30 days
          </label>
        </div>

        {login.isError ? (
          <p className={styles.error} role="alert">
            {login.error instanceof Error ? login.error.message : 'Login failed'}
          </p>
        ) : null}

        <button type="submit" className={styles.submit} disabled={login.isPending}>
          {login.isPending ? 'Signing in…' : 'LOG IN'}
        </button>
      </form>

      <hr className={styles.footerDivider} />

      <p className={styles.footer}>
        Don&apos;t have an account?{' '}
        <Link to={ROUTES.auth.signup} className={styles.footerLink}>
          Sign Up
        </Link>
      </p>
    </div>
  );
}
