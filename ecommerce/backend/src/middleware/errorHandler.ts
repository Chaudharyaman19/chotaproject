import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError';
import { isProd } from '../config/env';
import { logger } from '../config/logger';

/**
 * One place that converts every failure into a consistent JSON shape:
 *   { message, code, details?, requestId }
 * The frontend can branch on `code`, and `requestId` ties a user report to a log line.
 */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const requestId = String(req.id ?? '');

  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({ path: e.path.join('.'), message: e.message }));
    return res.status(400).json({
      message: details.map((d) => `${d.path}: ${d.message}`).join(', '),
      code: 'VALIDATION_ERROR',
      details,
      requestId,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({ message: err.message, code: err.code, details: err.details, requestId });
  }

  // Mongo duplicate key (e.g. unique email race)
  if (typeof err === 'object' && err && (err as { code?: number }).code === 11000) {
    return res.status(409).json({ message: 'Duplicate value', code: 'DUPLICATE', requestId });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: `Invalid ${err.path}`, code: 'INVALID_ID', requestId });
  }

  // Malformed JSON body etc.
  const status = (err as { status?: number })?.status;
  if (status && status >= 400 && status < 500) {
    return res.status(status).json({ message: (err as Error).message, code: 'BAD_REQUEST', requestId });
  }

  logger.error({ err, requestId }, 'unhandled error');
  res.status(500).json({
    message: isProd ? 'Internal server error' : err instanceof Error ? err.message : 'Server error',
    code: 'INTERNAL',
    requestId,
  });
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ message: 'Route not found', code: 'NOT_FOUND' });
}
