import { Prisma } from "@prisma/client";
// models/errors/ErrorHandler.ts
import type { Response } from "express";

export interface AppError {
	status: number;
	message: string;
	code?: string;
}

type ErrorCode =
	| "NOT_FOUND"
	| "UNAUTHORIZED"
	| "FORBIDDEN"
	| "BAD_REQUEST"
	| "CONFLICT"
	| "VALIDATION_ERROR"
	| "DATABASE_ERROR";

export class ErrorHandler {
	private static readonly ERROR_MAP: Record<string, AppError> = {
		// Prisma Errors
		P2025: { status: 404, message: "Record not found", code: "NOT_FOUND" },
		P2003: { status: 400, message: "Related record not found", code: "BAD_REQUEST" },
		P2002: { status: 409, message: "Duplicate entry", code: "CONFLICT" },
		P2014: { status: 400, message: "Invalid ID", code: "BAD_REQUEST" },
		P2016: { status: 400, message: "Invalid data format", code: "VALIDATION_ERROR" },
	};

	static handlePrismaError(error: unknown): AppError {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			return (
				this.ERROR_MAP[error.code] || {
					status: 400,
					message: `Database error: ${error.code}`,
					code: "DATABASE_ERROR",
				}
			);
		}

		if (error instanceof Prisma.PrismaClientValidationError) {
			return { status: 400, message: "Invalid data format", code: "VALIDATION_ERROR" };
		}

		// Остальные Prisma ошибки
		if (
			error instanceof Prisma.PrismaClientUnknownRequestError ||
			error instanceof Prisma.PrismaClientInitializationError ||
			error instanceof Prisma.PrismaClientRustPanicError
		) {
			return { status: 500, message: "Database error", code: "DATABASE_ERROR" };
		}

		return this.handleGenericError(error);
	}

	static handleBusinessError(error: Error): AppError {
		const message = error.message.toLowerCase();

		if (message.includes("not found")) {
			return { status: 404, message: error.message, code: "NOT_FOUND" };
		}

		if (message.includes("already exists") || message.includes("duplicate")) {
			return { status: 409, message: error.message, code: "CONFLICT" };
		}

		if (message.includes("invalid email or password") || message.includes("invalid credentials")) {
			return { status: 401, message: error.message, code: "UNAUTHORIZED" };
		}

		if (message.includes("invalid token") || message.includes("jwt expired")) {
			return { status: 403, message: error.message, code: "FORBIDDEN" };
		}

		return { status: 400, message: error.message, code: "BAD_REQUEST" };
	}

	private static handleGenericError(error: unknown): AppError {
		if (error instanceof Error) {
			return { status: 500, message: error.message, code: "INTERNAL_ERROR" };
		}

		return { status: 500, message: "Internal server error", code: "UNKNOWN_ERROR" };
	}

	static createError(status: number, message: string, code?: string): AppError {
		return { status, message, code };
	}

	static sendErrorResponse(error: AppError, res: Response): void {
		const response = {
			error: error.message,
			...(error.code && { code: error.code }),
			...(process.env.NODE_ENV === "development" && {
				timestamp: new Date().toISOString(),
			}),
		};

		res.status(error.status).json(response);
	}

	static handleAndSendError(error: unknown, res: Response, context?: string): void {
		console.error(context ? `[${context}] Error:` : "[ErrorHandler] Error:", error);

		let appError: AppError;

		if (
			error instanceof Prisma.PrismaClientKnownRequestError ||
			error instanceof Prisma.PrismaClientValidationError
		) {
			appError = this.handlePrismaError(error);
		} else if (error instanceof Error) {
			appError = this.handleBusinessError(error);
		} else {
			appError = this.handleGenericError(error);
		}

		this.sendErrorResponse(appError, res);
	}
}
