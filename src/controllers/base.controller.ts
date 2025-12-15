import { ErrorHandler } from "@/models/errors/ErrorHandler";
import type { TaskErrorMessages } from "@/models/errors/ErrorMessages";
import type { Response } from "express";

export abstract class BaseController {
	static sendError(
		res: Response<any, Record<string, any>>,
		GET_TASK_ERROR: TaskErrorMessages,
		error: unknown
	) {
		throw new Error("Method not implemented.");
	}
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

	static sendSuccess<T>(res: Response, data: T): void {
		res.status(200).json(data);
	}
}
