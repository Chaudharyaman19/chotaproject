import pino from 'pino';
import { env, isProd } from './env';

/**
 * Structured JSON logs in production (easy to grep / ship to CloudWatch),
 * pretty colourised logs in development. Secrets are redacted by path.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      '*.password',
      '*.passwordHash',
      '*.token',
      '*.refreshToken',
    ],
    censor: '[redacted]',
  },
  ...(isProd
    ? {}
    : { transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } } }),
});
