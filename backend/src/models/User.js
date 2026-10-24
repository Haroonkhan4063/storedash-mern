import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Account record. The password hash is excluded from query results by default
 * and must be requested explicitly with `.select('+password')`.
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: [8, 'Password must be at least 8 characters'], select: false },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  },
  { timestamps: true }
);

/**
 * Enforces the single-administrator policy at the persistence layer: a second
 * account can never be created or promoted to the `admin` role.
 */
userSchema.pre('save', async function enforceSingleAdmin(next) {
  if (this.role !== 'admin' || !(this.isNew || this.isModified('role'))) return next();
  const existing = await this.constructor.exists({ role: 'admin', _id: { $ne: this._id } });
  if (existing) return next(new Error('Only one administrator account is permitted'));
  next();
});

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  next();
});

/**
 * Constant-time comparison of a plaintext candidate against the stored hash.
 * @param {string} candidate
 * @returns {Promise<boolean>}
 */
userSchema.methods.matchPassword = function matchPassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
