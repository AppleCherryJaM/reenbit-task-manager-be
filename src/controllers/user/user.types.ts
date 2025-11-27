import type { Request } from "express";

export interface CreateUserInput {
	email: string;
	name?: string;
	password?: string;
}

export interface UpdateUserInput {
	email?: string;
	name?: string;
}

export interface UserResponse {
	id: string;
	email: string;
	name: string | null;
	createdAt: Date;
}

export interface UserRequest extends Request {
	params: {
		id: string;
	};
}

export interface CreateUserRequest extends Request {
	body: CreateUserInput;
}

export interface UpdateUserRequest extends UserRequest {
	body: UpdateUserInput;
}

export type UserTasksType = "authored" | "assigned";
