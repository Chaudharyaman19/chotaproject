import { randomUUID } from 'node:crypto';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import pinoHttp from 'pino-http';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import { errorHandler, notFound } from './middleware/errorHandler';
import { authLimiter, globalLimiter } from './middleware/rateLimit';
import { isOriginAllowed, isProd, isTest } from './config/env';
import { logger } from './config/logger';
import { redis } from './config/redis';

const app = express();

app.disable('x-powered-by');
// Behind Nginx on EC2 the real client IP is in X-Forwarded-For. Without this every
// user would share Nginx's IP and the rate limiter would treat them as one client.
app.set('trust proxy', isProd ? 1 : false);

// Request id + one structured access-log line per request (health checks are noise).
app.use(
  pinoHttp({
    logger,
    enabled: !isTest,
    genReqId: (req, res) => {
      const incoming = req.headers['x-request-id'];
      const id = typeof incoming === 'string' && incoming.length <= 64 ? incoming : randomUUID();
      res.setHeader('X-Request-Id', id);
      return id;
    },
    autoLogging: { ignore: (req) => req.url === '/api/health' || req.url === '/api/ready' },
    customLogLevel: (_req, res, err) => (err || res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'),
  })
);

app.use(helmet());
app.use(
  cors({
    // No Origin header = curl / server-to-server / health probes: nothing to restrict.
    origin: (origin, cb) => cb(null, !origin || isOriginAllowed(origin)),
    credentials: true,
  })
);
app.use(compression());

// Probes are registered before the rate limiter so monitoring can't be throttled.
app.get('/api/health', (_req, res) => res.json({ ok: true })); // liveness: process is up
app.get('/api/ready', async (_req, res) => {
  // readiness: dependencies are reachable (used by Docker healthcheck / load balancer)
  const mongo = mongoose.connection.readyState === 1;
  const redisOk = await redis.ping().then((r) => r === 'PONG').catch(() => false);
  res.status(mongo && redisOk ? 200 : 503).json({ ok: mongo && redisOk, mongo, redis: redisOk });
});

app.use(globalLimiter);

// NOTE: Razorpay webhooks need the *raw* body to verify the HMAC signature. That route
// is mounted BEFORE this json parser when we add billing.
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
