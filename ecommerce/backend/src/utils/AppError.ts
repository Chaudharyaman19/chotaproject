/**
 * Operational error with an HTTP status and a stable machine-readable `code`.
 * Controllers throw these; the central error handler turns them into JSON.
 */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string = 'ERROR',
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }

  static badRequest(message: string, code = 'BAD_REQUEST', details?: unknown) {
    return new AppError(400, message, code, details);
  }
  static unauthorized(message = 'Not authorized', code = 'UNAUTHORIZED') {
    return new AppError(401, message, code);
  }
  static forbidden(message = 'Forbidden', code = 'FORBIDDEN') {
    return new AppError(403, message, code);
  }
  static notFound(message = 'Not found', code = 'NOT_FOUND') {
    return new AppError(404, message, code);
  }
  static conflict(message: string, code = 'CONFLICT') {
    return new AppError(409, message, code);
  }
  static tooMany(message = 'Too many requests', code = 'RATE_LIMITED') {
    return new AppError(429, message, code);
  }
}
