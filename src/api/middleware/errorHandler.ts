import { Request, Response, NextFunction } from 'express';

/**
 * Error types for structured error handling
 */
export class AppError extends Error {
  public statusCode: number;
  public override message: string;
  public isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, true);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(404, message, true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, true);
  }
}

export class InternalError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(500, message, false);
  }
}

/**
 * Global error handler middleware
 * 
 * Catches all errors, logs them, and sends appropriate JSON response.
 * Distinguishes between operational errors (expected) and programming errors (unexpected).
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error
  console.error('[Error Handler]', {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack,
  });

  // Handle AppError instances
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
    });
    return;
  }

  // Handle unexpected errors
  res.status(500).json({
    error: {
      message: 'Internal server error',
      statusCode: 500,
    },
  });
}

/**
 * Async route handler wrapper to catch promise rejections
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
