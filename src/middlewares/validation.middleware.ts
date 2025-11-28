import type { NextFunction, Request, Response } from "express";
import { ZodError, type z } from "zod";
import type { AsyncRequestHandler } from "./validation.middleware.types";

const handleValidationError = (error: ZodError, res: Response): void => {
	res.status(400).json({
		error: "Validation failed",
		details: error,
	});
};

export const validateBody = <T>(schema: z.ZodSchema<T>): AsyncRequestHandler => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			req.body = await schema.parseAsync(req.body);
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				handleValidationError(error, res);
				return;
			}
			next(error);
		}
	};
};

export const validateParams = <T>(schema: z.ZodSchema<T>): AsyncRequestHandler => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			await schema.parseAsync(req.params);
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				handleValidationError(error, res);
				return;
			}
			next(error);
		}
	};
};

export const validateQuery = <T>(schema: z.ZodSchema<T>): AsyncRequestHandler => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			await schema.parseAsync(req.query);
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				handleValidationError(error, res);
				return;
			}
			next(error);
		}
	};
};
