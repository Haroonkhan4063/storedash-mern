/**
 * Wraps an async Express handler so rejected promises reach the central error middleware.
 * @param {import('express').RequestHandler} handler
 * @returns {import('express').RequestHandler}
 */
export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
