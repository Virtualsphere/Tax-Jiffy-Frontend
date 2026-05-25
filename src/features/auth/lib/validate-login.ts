import { z } from 'zod';
import type { LoginCredentials } from '@/features/auth/types/auth.types';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export function validateLogin(values: LoginCredentials) {
  return loginSchema.safeParse(values);
}
