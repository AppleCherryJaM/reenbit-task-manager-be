// middlewares/validators.ts
import { validateBody, validateParams, validateQuery } from "../middlewares/validation.middleware";
import {
	createTaskSchema,
	loginSchema,
	logoutSchema,
	refreshTokenSchema,
	registerSchema,
	taskIdSchema,
	updateTaskSchema,
	updateUserSchema,
	userIdSchema,
	userTasksQuerySchema,
} from "../models/zod/validation.schema";

// User validators
export const validateRegister = validateBody(registerSchema);
export const validateLogin = validateBody(loginSchema);
export const validateUpdateUser = [validateParams(userIdSchema), validateBody(updateUserSchema)];
export const validateUserId = validateParams(userIdSchema);
export const validateUserTasks = [
	validateParams(userIdSchema),
	validateQuery(userTasksQuerySchema),
];

// Task validators
export const validateCreateTask = validateBody(createTaskSchema);
export const validateUpdateTask = [validateParams(taskIdSchema), validateBody(updateTaskSchema)];
export const validateTaskId = validateParams(taskIdSchema);

// Auth validators
export const validateRefreshToken = validateBody(refreshTokenSchema);
export const validateLogout = validateBody(logoutSchema);
