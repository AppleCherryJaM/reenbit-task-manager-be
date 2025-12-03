import { z } from "zod";

import { TaskStatus } from "@/controllers/task/task.types";
import { idSchema } from "./common.schema";

export const createTaskSchema = z.object({
	title: z.string().min(1, "Title is required").max(255, "Title too long"),
	description: z.string().max(1000, "Description too long").optional(),
	status: z.nativeEnum(TaskStatus).optional(),
	priority: z.enum(["low", "medium", "high"]).optional(),
	deadline: z.string().optional().nullable(),
	authorId: idSchema,
	assigneeIds: z.array(idSchema).optional(),
});

export const updateTaskSchema = z.object({
	title: z.string().min(1, "Title is required").max(255, "Title too long").optional(),
	description: z.string().max(1000, "Description too long").optional().nullable(),
	status: z.nativeEnum(TaskStatus).optional(),
	priority: z.enum(["low", "medium", "high"]).optional(),
	deadline: z.string().optional().nullable(),
	assigneeIds: z.array(idSchema).optional(),
});

export const taskIdSchema = z.object({
	id: idSchema,
});
