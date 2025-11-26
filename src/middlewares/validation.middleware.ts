import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// Валидация только body
export const validateBody = (schema: z.ZodSchema<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        
        res.status(400).json({
          error: 'Validation failed',
          details: error,
        });
        return;
      }
      next(error);
    }
  };
};

// Валидация params (только проверка, без изменения)
export const validateParams = (schema: z.ZodSchema<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        
        res.status(400).json({
          error: 'Validation failed',
          details: error,
        });
        return;
      }
      next(error);
    }
  };
};

// Валидация query (только проверка, без изменения)
export const validateQuery = (schema: z.ZodSchema<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        
        res.status(400).json({
          error: 'Validation failed',
          details: error,
        });
        return;
      }
      next(error);
    }
  };
};