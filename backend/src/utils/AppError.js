/**
 * Operational error carrying an HTTP status code. Anything thrown as an
 * AppError is considered safe to expose to API clients verbatim.
 */
export class AppError extends Error {
  /**
   * @param {string} message Client-facing description of the failure.
   * @param {number} [statusCode=500] HTTP status code.
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
