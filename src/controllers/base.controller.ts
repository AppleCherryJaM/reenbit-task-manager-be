// base.controller.ts
import type { Response } from "express";
import { ErrorHandler } from "../models/errors/ErrorHandler";

export abstract class BaseController {
	static async handleRequest<T>(
		res: Response,
		operation: () => Promise<T>,
		errorMessage?: string
	): Promise<void> {
		try {
			const result = await operation();
			if (result === null) return;

			const status = errorMessage?.includes("creating") ? 201 : 200;
			res.status(status).json(result);
		} catch (error) {
			ErrorHandler.handleAndSendError(error, res, errorMessage);
		}
	}

	static sendNotFound(res: Response, message: string): void {
		res.status(404).json({ error: message });
	}

	static sendBadRequest(res: Response, message: string): void {
		res.status(400).json({ error: message });
	}

	static sendUnauthorized(res: Response, message = "Unauthorized"): void {
		res.status(401).json({ error: message });
	}
}
