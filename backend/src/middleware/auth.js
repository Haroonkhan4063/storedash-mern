/**
 * @module middleware/auth
 * Bearer-token authentication and role-based authorization.
 */
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Verifies the `Authorization: Bearer` token and attaches the account to `req.user`.
 */
export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new AppError('Authentication required', 401);

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new AppError('Session expired or invalid. Please sign in again.', 401);
  }

  const user = await User.findById(payload.id);
  if (!user) throw new AppError('Account no longer exists', 401);

  req.user = user;
  next();
});

/**
 * Restricts a route to the given roles. Must run after {@link protect}.
 * @param {...string} roles Permitted roles.
 * @returns {import('express').RequestHandler}
 */
export const restrictTo = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user?.role)) {
    return next(new AppError('You do not have permission to perform this action', 403));
  }
  next();
};
