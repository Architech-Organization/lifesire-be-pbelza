import { Router, Request, Response } from 'express';
import { Config } from '@infrastructure/config/Config';

/**
 * Health check endpoint
 * 
 * Returns system status and version information.
 * Used by monitoring systems and load balancers.
 */

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const config = Config.getInstance();
  
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: config.getOrDefault('API_VERSION', 'v1'),
    environment: config.getOrDefault('NODE_ENV', 'development'),
  });
});

export default router;
