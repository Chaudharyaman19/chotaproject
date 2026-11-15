import { NextFunction, Request, Response } from 'express';
import { RateLimiterMemory, RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import { redis } from '../config/redis';
import { logger } from '../config/logger';
import { isTest } from '../config/env';

interface Options {
  /** Redis key namespace, e.g. "rl:login". */
  keyPrefix: string;
  /** Max requests allowed inside `durationSec`. */
  points: number;
  durationSec: number;
  /** If set, a client that exhausts its points is blocked for this long (brute-force defence). */
  blockSec?: number;
  /** Builds the bucket key. Defaults to client IP. */
  key?: (req: Request) => string;
  message?: string;
}

/**
 * Redis-backed fixed-window limiter (atomic INCR+EXPIRE under the hood) so limits
 * are shared across every API process / EC2 instance.
 *
 * `insuranceLimiter`: if Redis is unreachable we fall back to an in-memory limiter
 * rather than failing open (no protection) or failing closed (site down).
 */
export function rateLimit(opts: Options) {
  const insuranceLimiter = new RateLimiterMemory({
    keyPrefix: opts.keyPrefix,
    points: opts.points,
    duration: opts.durationSec,
  });

  const limiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: opts.keyPrefix,
    points: opts.points,
    duration: opts.durationSec,
    blockDuration: opts.blockSec ?? 0,
    insuranceLimiter,
  });

  return async (req: Request, res: Response, next: NextFunction) => {
    if (isTest) return next();
    const key = opts.key ? opts.key(req) : req.ip || 'unknown';
    try {
      const r = await limiter.consume(key);
      setHeaders(res, opts.points, r);
      next();
    } catch (rej) {
      if (rej instanceof RateLimiterRes) {
        setHeaders(res, opts.points, rej);
        res.setHeader('Retry-After', Math.ceil(rej.msBeforeNext / 1000));
        logger.warn({ prefix: opts.keyPrefix, key, ip: req.ip }, 'rate limit hit');
        return res.status(429).json({
          message: opts.message ?? 'Too many requests, please slow down.',
          code: 'RATE_LIMITED',
          retryAfterSec: Math.ceil(rej.msBeforeNext / 1000),
        });
      }
      // Unexpected limiter failure: don't take the API down because of it.
      logger.error({ err: (rej as Error)?.message }, 'rate limiter error, allowing request');
      next();
    }
  };
}

function setHeaders(res: Response, limit: number, r: RateLimiterRes) {
  res.setHeader('RateLimit-Limit', limit);
  res.setHeader('RateLimit-Remaining', Math.max(0, r.remainingPoints));
  res.setHeader('RateLimit-Reset', Math.ceil(r.msBeforeNext / 1000));
}

/** Broad safety net for the whole API: 300 req / minute / IP. */
export const globalLimiter = rateLimit({ keyPrefix: 'rl:global', points: 300, durationSec: 60 });

/** Auth endpoints in general: 30 req / 15 min / IP. */
export const authLimiter = rateLimit({
  keyPrefix: 'rl:auth',
  points: 30,
  durationSec: 15 * 60,
  message: 'Too many auth attempts. Try again later.',
});

/**
 * Credential-stuffing defence: 5 attempts / 15 min per (IP + email); once exhausted,
 * block that pair for 15 minutes. Keying on email too stops one IP from hammering a
 * single account, while not locking out everyone behind a shared NAT.
 */
export const loginLimiter = rateLimit({
  keyPrefix: 'rl:login',
  points: 5,
  durationSec: 15 * 60,
  blockSec: 15 * 60,
  key: (req) => `${req.ip}:${String(req.body?.email ?? '').toLowerCase()}`,
  message: 'Too many failed login attempts. Try again in 15 minutes.',
});
