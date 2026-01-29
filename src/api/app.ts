import express, { Express, Request, Response } from 'express';
import { Config } from '@infrastructure/config/Config';
import { errorHandler } from '@api/middleware/errorHandler';
import { requestLogger } from '@api/middleware/requestLogger';
import { sanitizeInput, rateLimiter } from '@api/middleware/security';
import healthRouter from '@api/routes/health';
import swaggerRouter from '@api/routes/swagger';
import patientRouter from '@api/routes/patients';
import reportRouter from '@api/routes/reports';
import analysisRouter from '@api/routes/analyses';
import noteRouter from '@api/routes/notes';

/**
 * Express application bootstrap
 * 
 * Creates and configures Express app with:
 * - Request logging (pino)
 * - Input sanitization
 * - Rate limiting
 * - JSON body parser
 * - Health check route
 * - API versioning (v1)
 * - Global error handler
 */

export function createApp(): Express {
  const app = express();
  const config = Config.getInstance();
  const apiVersion = config.getOrDefault('API_VERSION', 'v1');

  // Security middleware (T090, T091)
  app.use(rateLimiter);
  app.use(sanitizeInput);

  // Request logging (T085)
  app.use(requestLogger);

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check (no API version prefix)
  app.use('/health', healthRouter);

  // API documentation (no API version prefix)
  app.use('/api-docs', swaggerRouter);

  // API routes with version prefix
  const apiRouter = express.Router();
  
  // Register feature routes
  apiRouter.use('/patients', patientRouter);
  apiRouter.use('/', reportRouter); // Report routes use both /patients/:id/reports and /reports/:id
  apiRouter.use('/', analysisRouter); // Analysis routes for /reports/:id/analyze
  apiRouter.use('/', noteRouter); // Note routes for /reports/:id/notes and /notes/:id
  
  app.use(`/api/${apiVersion}`, apiRouter);

  // 404 handler for unknown routes
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: {
        message: `Route not found: ${req.method} ${req.path}`,
        statusCode: 404,
      },
    });
  });

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}
