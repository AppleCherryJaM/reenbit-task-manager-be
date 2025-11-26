// models/zod/validation.schema.ts
import { z } from "zod";

// Common schemas
const idSchema = z.string().uuid("Invalid ID format");
const emailSchema = z.string().email("Invalid email address");
const nameSchema = z.string().min(2, "Name must be at least 2 characters").optional();

// User validation schemas
export const registerSchema = z.object({
	name: nameSchema,
	email: emailSchema,
	password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, "Password is required"),
});

export const updateUserSchema = z.object({
	name: nameSchema,
	email: emailSchema.optional(),
});

export const userIdSchema = z.object({
	id: idSchema,
});

// Task validation schemas
export const createTaskSchema = z.object({
	title: z.string().min(1, "Title is required").max(255, "Title too long"),
	description: z.string().max(1000, "Description too long").optional(),
	status: z.enum(["pending", "in_progress", "completed"]).optional(),
	authorId: idSchema,
	assigneeIds: z.array(idSchema).optional(),
});

export const updateTaskSchema = z.object({
	title: z.string().min(1, "Title is required").max(255, "Title too long").optional(),
	description: z.string().max(1000, "Description too long").optional().nullable(),
	status: z.enum(["pending", "in_progress", "completed"]).optional(),
	assigneeIds: z.array(idSchema).optional(),
});

export const taskIdSchema = z.object({
	id: idSchema,
});

// Auth validation schemas
export const refreshTokenSchema = z.object({
	refreshToken: z.string().min(1, "Refresh token is required"),
});

export const logoutSchema = z.object({
	refreshToken: z.string().min(1, "Refresh token is required"),
});

// Query validation schemas
export const userTasksQuerySchema = z.object({
	type: z.enum(["authored", "assigned"]).optional(),
});
