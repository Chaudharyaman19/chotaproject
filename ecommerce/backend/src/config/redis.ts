import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

/**
 * Single shared Redis connection for rate limiting, caching, token denylist, etc.
 *
 * BullMQ needs its own connections with `maxRetriesPerRequest: null`, so queues
 * will create theirs through `createRedis()` below rather than reusing this one.
 */
export function createRedis(opts: { forQueue?: boolean } = {}) {
  const client = new Redis(env.REDIS_URL, {
    // Queue workers block on Redis commands, so retries must be unbounded for them.
    maxRetriesPerRequest: opts.forQueue ? null : 2,
    enableReadyCheck: true,
    lazyConnect: false,
  });
  client.on('error', (err) => logger.error({ err: err.message }, 'redis error'));
  return client;
}

export const redis = createRedis();

export async function closeRedis() {
  await redis.quit().catch(() => redis.disconnect());
}
