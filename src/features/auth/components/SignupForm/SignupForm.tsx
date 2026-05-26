import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useSignup } from '@/features/auth/hooks/useSignup';
import styles from '@/features/auth/components/SignupForm/SignupForm.module.css';

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={styles.inputIconSvg}>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5 19c0-3.3 3.1-6 7-6s7 2.7 7 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={styles.inputIconSvg}>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={styles.inputIconSvg}>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M8 11V8a4 4 0 118 0v3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  if (hidden) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className={styles.toggleIconSvg}>
        <path
          d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.75" />
        <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={styles.toggleIconSvg}>
      <path
        d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

export function SignupForm() {
  const signup = useSignup();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    signup.mutate({ username, email, phone, password });
  };

  return (
    <div className={styles.card}>
      <header className={styles.header}>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Begin your journey with TaxJiffy.</p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="signup-username">
            USERNAME
          </label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon} aria-hidden>
              <UserIcon />
            </span>
            <input
              id="signup-username"
              name="username"
              type="text"
              className={styles.input}
              placeholder="jdoe_admin"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="signup-email">
            EMAIL ADDRESS
          </label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon} aria-hidden>
              <MailIcon />
            </span>
            <input
              id="signup-email"
              name="email"
              type="email"
              className={styles.input}
              placeholder="john@company.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="signup-phone">
            PHONE NUMBER
          </label>
          <div className={`${styles.inputWrap} ${styles.inputWrapNarrow}`}>
            <input
              id="signup-phone"
              name="phone"
              type="tel"
              className={styles.input}
              placeholder="+1 (555) 000-0000"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="signup-password">
            PASSWORD
          </label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon} aria-hidden>
              <LockIcon />
            </span>
            <input
              id="signup-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              className={styles.input}
              placeholder="••••••••"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className={styles.toggle}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <EyeIcon hidden={showPassword} />
            </button>
          </div>
        </div>

        {signup.isError ? (
          <p className={styles.error} role="alert">
            {signup.error ?? 'Signup failed'}
          </p>
        ) : null}

        {signup.isSuccess ? (
          <p className={styles.success} role="status">
            Account created successfully! Redirecting to login…
          </p>
        ) : null}

        <button type="submit" className={styles.submit} disabled={signup.isPending}>
          {signup.isPending ? 'Creating account…' : 'SIGN UP'}
        </button>
      </form>

      <p className={styles.footer}>
        Already have an account?{' '}
        <Link to={ROUTES.auth.login} className={styles.footerLink}>
          Log In
        </Link>
      </p>
    </div>
  );
}

