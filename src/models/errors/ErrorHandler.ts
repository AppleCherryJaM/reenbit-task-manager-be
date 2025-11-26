import type { Response } from "express";
import { Prisma } from "../../generated/prisma/client";

export interface AppError {
	status: number;
	message: string;
	code?: string;
	stack?: string;
}

export class ErrorHandler {
	static handlePrismaError(error: unknown): AppError {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			const errorMap: Record<string, AppError> = {
				P2025: { status: 404, message: "Record not found", code: "NOT_FOUND" },
				P2003: { status: 400, message: "Related record not found", code: "FOREIGN_KEY_CONSTRAINT" },
				P2002: { status: 409, message: "Duplicate entry", code: "UNIQUE_CONSTRAINT" },
				P2014: { status: 400, message: "Invalid ID", code: "INVALID_ID" },
				P2016: { status: 400, message: "Invalid data format", code: "INVALID_DATA" },
			};

			return (
				errorMap[error.code] || {
					status: 400,
					message: `Database error: ${error.code}`,
					code: "DATABASE_ERROR",
				}
			);
		}

		if (error instanceof Prisma.PrismaClientUnknownRequestError) {
			return {
				status: 500,
				message: "Unknown database error",
				code: "UNKNOWN_DATABASE_ERROR",
				stack: error.stack || error.message,
			};
		}

		if (error instanceof Prisma.PrismaClientValidationError) {
			return {
				status: 400,
				message: "Invalid data format",
				code: "VALIDATION_ERROR",
				stack: error.stack || error.message,
			};
		}

		if (error instanceof Prisma.PrismaClientInitializationError) {
			return {
				status: 500,
				message: "Database connection error",
				code: "INITIALIZATION_ERROR",
				stack: error.stack || error.message,
			};
		}

		if (error instanceof Prisma.PrismaClientRustPanicError) {
			return {
				status: 500,
				message: "Database internal error",
				code: "RUST_PANIC",
				stack: error.stack || error.message,
			};
		}

		if (error instanceof Error) {
			return {
				status: 500,
				message: error.message,
				code: "INTERNAL_ERROR",
				stack: error.stack || error.message,
			};
		}

		return { status: 500, message: "Internal server error", code: "UNKNOWN_ERROR" };
	}

	static sendErrorResponse(error: AppError, res: Response): void {
		res.status(error.status).json({
			error: error.message,
			code: error.code,
			...(process.env.NODE_ENV === "development" && { stack: error.stack }),
		});
	}

	static handleAndSendError(error: unknown, res: Response, defaultMessage?: string): void {
		console.error("Application Error:", error);

		const appError = this.handlePrismaError(error);

		if (defaultMessage && appError.status === 500) {
			appError.message = defaultMessage;
		}

		this.sendErrorResponse(appError, res);
	}
}
