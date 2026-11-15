import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Fail-fast env validation: if anything required is missing or malformed the
 * process exits at boot with a readable message, instead of crashing later
 * with `undefined` deep inside a request handler.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  REDIS_URL: z.string().default('redis://127.0.0.1:6379'),

  // Comma-separated list of allowed browser origins.
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),

  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const lines = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`);
  // logger isn't available yet (it depends on env), so write to stderr directly.
  console.error(`Invalid environment configuration:\n${lines.join('\n')}`);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
export const allowedOrigins = env.FRONTEND_URL.split(',').map((s) => s.trim()).filter(Boolean);

const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

/**
 * Dev: any localhost port is fine (Next hops to :3001, :3002… when :3000 is busy, and a
 * strict list then silently blocks every request). Prod: only the configured list.
 */
export const isOriginAllowed = (origin: string) =>
  allowedOrigins.includes(origin) || (!isProd && LOCAL_ORIGIN.test(origin));
