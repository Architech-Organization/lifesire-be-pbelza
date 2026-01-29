import pino from 'pino';
import pinoHttp from 'pino-http';
import { Request, Response } from 'express';

/**
 * Request logging middleware (T085)
 * 
 * Structured logging with pino for production observability.
 * Logs all HTTP requests with timestamps, methods, URLs, status codes, and response times.
 */

// Create pino logger instance
// Note: pino-pretty is a dev dependency only, so we don't use it in production
const logger = pino({
  level: process.env['LOG_LEVEL'] || 'info',
});

// HTTP request logger middleware
export const requestLogger = pinoHttp({
  logger,
  customLogLevel: (_req: Request, res: Response, err?: Error) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
      remoteAddress: req.socket?.remoteAddress,
      remotePort: req.socket?.remotePort,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
  autoLogging: {
    ignore: (req) => req.url === '/health', // Don't log health checks
  },
});

export { logger };
