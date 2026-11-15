import { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Express 4 does NOT forward rejected promises from async handlers to the error
 * middleware, so a thrown ZodError / AppError would hang the request and, on
 * modern Node, crash the process via an unhandled rejection. Wrapping every
 * async handler with this routes failures into `errorHandler` instead.
 */
export function asyncHandler<Req extends Request = Request>(
  fn: (req: Req, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req as Req, res, next)).catch(next);
  };
}
