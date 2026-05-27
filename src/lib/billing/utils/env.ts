import { z } from 'zod';

const envSchema = z.object({
  PAYMENT_MODE: z.enum(['mock', 'sandbox', 'production']).default('mock'),
  XENDIT_SECRET_KEY: z.string().min(1),
  XENDIT_WEBHOOK_TOKEN: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export const env = envSchema.parse({
  PAYMENT_MODE: process.env.PAYMENT_MODE,
  XENDIT_SECRET_KEY: process.env.XENDIT_SECRET_KEY,
  XENDIT_WEBHOOK_TOKEN: process.env.XENDIT_WEBHOOK_TOKEN,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV,
});

export const isProduction = env.NODE_ENV === 'production' && env.PAYMENT_MODE === 'production';
export const isMockPayment = env.PAYMENT_MODE === 'mock' && !isProduction;
