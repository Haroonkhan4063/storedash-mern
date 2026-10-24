/**
 * @module server
 * Process entry point: connects to MongoDB, starts the HTTP listener, and
 * coordinates graceful shutdown on termination signals.
 */
import app from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';

async function bootstrap() {
  const connection = await connectDB();
  console.log(`MongoDB connected (${connection.host})`);

  const server = app.listen(env.port, () => {
    console.log(`API listening on port ${env.port} [${env.nodeEnv}]`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received. Shutting down.`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
