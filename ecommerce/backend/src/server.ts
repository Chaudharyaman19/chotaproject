import { env } from './config/env';
import { logger } from './config/logger';
import app from './app';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import { closeRedis } from './config/redis';

async function main() {
  await connectDB(env.MONGODB_URI);
  const server = app.listen(env.PORT, () => logger.info(`Backend running on :${env.PORT} (${env.NODE_ENV})`));

  // Graceful shutdown: stop accepting new connections, let in-flight requests finish,
  // then close DB/Redis. Docker/EC2 send SIGTERM on every deploy; without this users
  // would see dropped requests during each release.
  let shuttingDown = false;
  async function shutdown(signal: string) {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, 'shutting down');
    const force = setTimeout(() => {
      logger.error('forced exit after 10s');
      process.exit(1);
    }, 10_000);
    force.unref();
    server.close(async () => {
      await mongoose.disconnect().catch(() => undefined);
      await closeRedis();
      logger.info('shutdown complete');
      process.exit(0);
    });
  }
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'unhandledRejection');
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'uncaughtException');
  process.exit(1);
});

main().catch((err) => {
  logger.fatal({ err }, 'failed to start');
  process.exit(1);
});
