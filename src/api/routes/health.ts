import { Router, Request, Response } from 'express';
import { Config } from '@infrastructure/config/Config';
import { getDataSource } from '@infrastructure/config/database';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Health check endpoint
 * 
 * Returns system status and version information.
 * Checks database connectivity and file storage availability.
 * Used by monitoring systems and load balancers.
 */

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const config = Config.getInstance();
  const checks: Record<string, { status: string; message?: string }> = {};

  // Database connectivity check (T088)
  try {
    const dataSource = await getDataSource();
    if (dataSource.isInitialized) {
      await dataSource.query('SELECT 1');
      checks['database'] = { status: 'healthy' };
    } else {
      checks['database'] = { status: 'unhealthy', message: 'Not initialized' };
    }
  } catch (error) {
    checks['database'] = { 
      status: 'unhealthy', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    };
  }

  // File storage check (T089)
  try {
    const uploadPath = config.getOrDefault('UPLOAD_PATH', './data/uploads');
    const absolutePath = join(process.cwd(), uploadPath);
    if (existsSync(absolutePath)) {
      checks['storage'] = { status: 'healthy' };
    } else {
      checks['storage'] = { status: 'unhealthy', message: 'Upload directory not found' };
    }
  } catch (error) {
    checks['storage'] = { 
      status: 'unhealthy', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    };
  }

  // Overall health status
  const isHealthy = Object.values(checks).every(check => check.status === 'healthy');
  const statusCode = isHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    version: config.getOrDefault('API_VERSION', 'v1'),
    environment: config.getOrDefault('NODE_ENV', 'development'),
    checks,
  });
});

export default router;
