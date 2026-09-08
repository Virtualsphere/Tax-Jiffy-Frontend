import { z } from 'zod';

const envSchema = z.object({
  VITE_APP_NAME: z.string().default('Tax Jiffy'),
  VITE_API_BASE_URL: z.string().default('/api'),
  VITE_WS_BASE_URL: z.string().default('/ws'),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

export const env = parsed.data;
