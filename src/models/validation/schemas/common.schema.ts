import { z } from "zod";

export const idSchema = z.string().uuid("Invalid ID format");
export const emailSchema = z.string().email("Invalid email address");
export const nameSchema = z.string().min(2, "Name must be at least 2 characters").optional();
export const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
