import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  if (err instanceof ZodError) {
    return res.status(400).json({ message: err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ') });
  }
  const message = err instanceof Error ? err.message : 'Server error';
  res.status(500).json({ message });
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ message: 'Route not found' });
}
