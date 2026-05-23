import type { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import styles from '@/components/ui/Input/Input.module.css';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className={styles.field}>
      {label ? (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(styles.input, error && styles.inputError, className)}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error ? <span className={styles.error}>{error}</span> : null}
    </div>
  );
}
