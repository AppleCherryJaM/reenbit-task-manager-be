import { validateBody, validateParams } from "@/middlewares/validation.middleware";
import {
	createTaskSchema,
	taskIdSchema,
	updateTaskSchema,
} from "@/models/validation/validation.schema";

export const validateCreateTask = validateBody(createTaskSchema);
export const validateUpdateTask = [validateParams(taskIdSchema), validateBody(updateTaskSchema)];
export const validateTaskId = validateParams(taskIdSchema);
