import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError as ClassValidatorError } from 'class-validator';
import { ValidationError } from './errorHandler';

/**
 * Validation middleware factory
 * 
 * Validates request body against DTO class using class-validator decorators.
 * Transforms plain object to DTO instance and runs validation.
 */
export function validateBody(dtoClass: any) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Transform plain object to DTO instance
      const dtoInstance = plainToInstance(dtoClass, req.body, {
        enableImplicitConversion: true,
      });

      // Validate DTO instance
      const errors: ClassValidatorError[] = await validate(dtoInstance, {
        whitelist: true,      // Strip non-whitelisted properties
        forbidNonWhitelisted: true,  // Throw error on extra properties
        validationError: { target: false },
      });

      if (errors.length > 0) {
        // Format validation errors
        const messages = errors.map(error => {
          const constraints = error.constraints || {};
          return Object.values(constraints).join(', ');
        });

        throw new ValidationError(`Validation failed: ${messages.join('; ')}`);
      }

      // Attach validated DTO to request
      req.body = dtoInstance;
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Validation middleware for query parameters
 */
export function validateQuery(dtoClass: any) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const dtoInstance = plainToInstance(dtoClass, req.query);
      const errors = await validate(dtoInstance as object);

      if (errors.length > 0) {
        const messages = errors.map(error => {
          const constraints = error.constraints || {};
          return Object.values(constraints).join(', ');
        });

        throw new ValidationError(`Query validation failed: ${messages.join('; ')}`);
      }

      req.query = dtoInstance as any;
      next();
    } catch (error) {
      next(error);
    }
  };
}
