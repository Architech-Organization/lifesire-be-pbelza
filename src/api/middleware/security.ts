import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Security middleware (T090, T091)
 * 
 * Input sanitization and rate limiting for production security.
 */

/**
 * Input sanitization middleware (T090)
 * 
 * Removes $ and . characters from user input to prevent NoSQL injection attacks.
 * Sanitizes request body, query params, and URL params.
 */
export const sanitizeInput = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`[Security] Sanitized input in ${req.method} ${req.url}, key: ${key}`);
  },
});

/**
 * Rate limiting middleware (T091)
 * 
 * Basic rate limiting to prevent abuse and DoS attacks.
 * - 100 requests per 15 minutes per IP
 * - Returns 429 Too Many Requests when limit exceeded
 */
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: {
      message: 'Too many requests from this IP, please try again later.',
      statusCode: 429,
    },
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: {
        message: 'Too many requests from this IP, please try again later.',
        statusCode: 429,
      },
    });
  },
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.url === '/health';
  },
});
