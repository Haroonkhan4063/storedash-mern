/**
 * @module middleware/error
 * Terminal middleware: unknown-route handling and uniform JSON error envelopes.
 */
import { env } from '../config/env.js';

export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

/**
 * Normalises operational, Mongoose, and unexpected errors into `{ message }` payloads.
 * Stack traces are only included outside production.
 */
export const errorHandler = (err, _req, res, _next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join('. ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid value for ${err.path}`;
  } else if (err.code === 11000) {
    status = 409;
    message = 'A record with that value already exists';
  }

  if (status >= 500) {
    console.error(err);
    if (env.isProduction) message = 'Internal server error';
  }

  res.status(status).json({ message, ...(env.isProduction ? {} : { stack: err.stack }) });
};
