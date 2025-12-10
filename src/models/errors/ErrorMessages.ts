export enum TaskErrorMessages {
	TASK_NOT_FOUND = "Task not found",
	AUTHOR_NOT_FOUND = "Author not found",
	GET_TASK_ERROR = "Error while getting task",
	UPDATE_TASK_ERROR = "Error while updating task",
	CREATE_TASK_ERROR = "Error while creating task",
	DELETE_TASK_ERROR = "Error while creating task",
	INVALID_TASK_STATUS = "invalid task status",
	ASSIGNEES_NOT_FOUND = "One or more assignees not found",
	ARRAY_IS_REQUIRED = "Tasks array is required",
	BATCH_LIMIT = "Maximum 50 tasks per batch",
	BATCH_TASK_FAILURE = "Failed to create tasks batch",
	REQUIRED_FIELDS = "Title and author ID are required"
}

export enum UserErrorMessages {
	USER_NOT_FOUND = "User not found",
	UPDATE_USER_ERROR = "Error while updating user",
	CREATE_USER_ERROR = "Error while creating user",
	FETCH_USER_ERROR = "Error while fetching users",
	DELETE_USER_ERROR = "Error while creating user",
	LOGIN_USER_ERROR = "Error while logging in",
	LOGOUT_USER_ERROR = "Error while logging out",
	INVALID_EMAIL_OR_PASSWORD = "Invalid email or password",
	EMAIL_ALREADY_EXISTS = "User with this email already exists",
	GET_USER_TASK_ERROR = "Error while getting user tasks",
	USER_NOT_AUTHENTICATED = "User not authenticated"
}

export enum RefreshTokenErrorMessages {
	INVALID_REFRESH_TOKEN = "Invalid refresh token",
	EXPIRED_REFRESH_TOKEN = "Refresh token expired",
	REQUIRED_REFRESH_TOKEN = "Refresh token is required",
	REFRESH_TOKEN_ERROR = "Error while refreshing token",
}

export const UNKNOWN_ERROR = "Unknown error";