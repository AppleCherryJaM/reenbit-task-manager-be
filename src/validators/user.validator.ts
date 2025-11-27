import { validateBody, validateParams, validateQuery } from "../middlewares/validation.middleware";
import {
	loginSchema,
	registerSchema,
	updateUserSchema,
	userIdSchema,
	userTasksQuerySchema,
} from "../models/validation/validation.schema";

export const validateRegister = validateBody(registerSchema);
export const validateLogin = validateBody(loginSchema);
export const validateUpdateUser = [validateParams(userIdSchema), validateBody(updateUserSchema)];
export const validateUserId = validateParams(userIdSchema);
export const validateUserTasks = [
	validateParams(userIdSchema),
	validateQuery(userTasksQuerySchema),
];
