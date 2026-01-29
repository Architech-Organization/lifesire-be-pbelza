import 'module-alias/register';
import 'reflect-metadata';
import { createApp } from '@api/app';
import { Config } from '@infrastructure/config/Config';
import { getDataSource, closeDataSource } from '@infrastructure/config/database';

/**
 * Main entry point
 * 
 * Initializes application:
 * 1. Load configuration
 * 2. Connect to database
 * 3. Wire adapter implementations
 * 4. Start Express server
 * 5. Handle graceful shutdown
 */

async function bootstrap() {
  try {
    // Load configuration
    const config = Config.getInstance();
    const port = config.getNumber('PORT', 3000);

    console.log('[Bootstrap] Starting application...');
    console.log(`[Bootstrap] Environment: ${config.get('NODE_ENV')}`);
    console.log(`[Bootstrap] Database type: ${config.get('DB_TYPE')}`);

    // Initialize database connection
    console.log('[Bootstrap] Connecting to database...');
    const dataSource = await getDataSource();
    console.log('[Bootstrap] Database connected');

    // Run migrations automatically in production (T094)
    if (config.isProduction()) {
      console.log('[Bootstrap] Running database migrations...');
      await dataSource.runMigrations();
      console.log('[Bootstrap] Migrations completed');
    } else {
      console.log('[Bootstrap] Skipping migrations in development mode');
    }

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(port, () => {
      console.log(`[Bootstrap] Server listening on port ${port}`);
      console.log(`[Bootstrap] Health check: http://localhost:${port}/health`);
      console.log(`[Bootstrap] API base: http://localhost:${port}/api/${config.get('API_VERSION')}`);
    });

    // Graceful shutdown handler
    const shutdown = async (signal: string) => {
      console.log(`[Bootstrap] Received ${signal}, shutting down gracefully...`);
      
      // Stop accepting new connections
      server.close(() => {
        console.log('[Bootstrap] HTTP server closed');
      });

      // Close database connection
      await closeDataSource();
      console.log('[Bootstrap] Database connection closed');

      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('[Bootstrap] Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
