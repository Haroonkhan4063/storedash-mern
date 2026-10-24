import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const signToken = (id) => jwt.sign({ id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

const serializeUser = ({ _id, name, email, role }) => ({ _id, name, email, role });

/**
 * POST /api/auth/register
 * Public sign-up. The role is fixed to `customer`; privileged accounts are provisioned out of band.
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw new AppError('Name, email and password are required', 400);
  if (await User.exists({ email: String(email).toLowerCase() })) {
    throw new AppError('An account with this email already exists', 409);
  }

  const user = await User.create({ name, email, password, role: 'customer' });
  res.status(201).json({ token: signToken(user._id), user: serializeUser(user) });
});

/**
 * POST /api/auth/login
 * Issues a signed JWT. Identical error text for unknown email and wrong password prevents account enumeration.
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() }).select('+password');

  if (!user || !(await user.matchPassword(String(password || '')))) {
    throw new AppError('Invalid email or password', 401);
  }
  res.json({ token: signToken(user._id), user: serializeUser(user) });
});

/**
 * GET /api/auth/me
 * Resolves the account behind the presented token; used to rehydrate client sessions.
 */
export const getMe = (req, res) => {
  res.json({ user: serializeUser(req.user) });
};
