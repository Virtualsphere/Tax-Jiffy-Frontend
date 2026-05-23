import { useState, type FormEvent } from 'react';
import { Button, Input } from '@/components/ui';
import { useLogin } from '@/features/auth/hooks/useLogin';
import styles from '@/features/auth/components/LoginForm/LoginForm.module.css';

export function LoginForm() {
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={styles.heading}>Sign in</h1>
      <p className={styles.subheading}>Welcome back to Tax Jiffy</p>

      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {login.isError ? (
        <p className={styles.error} role="alert">
          {login.error instanceof Error ? login.error.message : 'Login failed'}
        </p>
      ) : null}

      <Button type="submit" isLoading={login.isPending} className={styles.submit}>
        Sign in
      </Button>
    </form>
  );
}
