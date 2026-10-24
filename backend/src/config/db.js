/**
 * @module config/db
 * MongoDB connection management.
 */
import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);

/**
 * Opens the shared Mongoose connection.
 * @returns {Promise<mongoose.Connection>} The active connection.
 * @throws {Error} Propagates connection failures to the caller, which owns exit behaviour.
 */
export async function connectDB() {
  const { connection } = await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 15000 });
  return connection;
}

/**
 * Closes the shared Mongoose connection.
 * @returns {Promise<void>}
 */
export async function disconnectDB() {
  await mongoose.disconnect();
}
