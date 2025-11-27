import { z } from "zod";
import { emailSchema, idSchema, nameSchema, passwordSchema } from "./common.schema";

export const registerSchema = z.object({
	name: nameSchema,
	email: emailSchema,
	password: passwordSchema,
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
