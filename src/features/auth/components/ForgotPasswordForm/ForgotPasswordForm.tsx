import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import styles from './ForgotPasswordForm.module.css';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call for now
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1000);
  };

  return (
    <div className={styles.card}>
      <header className={styles.header}>
        <h1 className={styles.title}>Forgot Password</h1>
        <p className={styles.subtitle}>
          Enter your email address to receive a password reset link.
        </p>
      </header>

      {isSuccess ? (
        <div className={styles.form}>
          <p className={styles.success}>
            Password reset link sent! Please check your email inbox and spam folder.
          </p>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="forgot-email">
              EMAIL ADDRESS
            </label>
            <div className={styles.inputWrap}>
              <input
                id="forgot-email"
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

          <button type="submit" className={styles.submit} disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'SEND RESET LINK'}
          </button>
        </form>
      )}

      <hr className={styles.footerDivider} />

      <p className={styles.footer}>
        Remember your password?{' '}
        <Link to={ROUTES.auth.login} className={styles.footerLink}>
          Log In
        </Link>
      </p>
    </div>
  );
}
