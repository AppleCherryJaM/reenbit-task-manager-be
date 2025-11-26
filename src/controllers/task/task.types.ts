import type { Request } from "express";

// Core data interfaces
export interface TaskCreateData {
	title: string;
	description?: string;
	status?: string;
	authorId: string;
	assigneeIds?: string[];
}

export interface TaskUpdateData {
	title?: string;
	description?: string;
	status?: string;
	assigneeIds?: string[];
}

export interface AssigneeOperationData {
	userId: string;
}

// Response interfaces
export interface UserBasicInfo {
	id: string;
	name: string | null;
	email: string;
}

export interface TaskWithRelations {
	id: string;
	title: string;
	description: string | null;
	status: string;
	authorId: string;
	createdAt: Date;
	updatedAt: Date;
	author: UserBasicInfo;
	assignees: UserBasicInfo[];
}

export interface CreateTaskRequest extends Request {
	body: TaskCreateData;
}

export interface UpdateTaskRequest extends Request {
	body: TaskUpdateData;
	params: { id: string };
}

export interface TaskParamsRequest extends Request {
	params: { id: string };
}

export interface AssigneeOperationRequest extends Request {
	body: AssigneeOperationData;
	params: { id: string };
}

export enum TaskStatus {
	PENDING = "pending",
	IN_PROGRESS = "in_progress",
	COMPLETED = "completed",
}

export type TaskResponse = Omit<TaskWithRelations, "author" | "assignees">;
