// controllers/task.types.ts
import type { Request } from "express";

export interface TaskCreateData {
	title: string;
	description?: string;
	status?: TaskStatus;
	authorId: string;
	assigneeIds?: string[];
}

export interface TaskUpdateData {
	title?: string;
	description?: string | null;
	status?: TaskStatus;
	assigneeIds?: string[];
}

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

// Request interfaces
export interface TaskRequest extends Request {
	params: { id: string };
}

export interface CreateTaskRequest extends Request {
	body: TaskCreateData;
}

export interface UpdateTaskRequest extends TaskRequest {
	body: TaskUpdateData;
}

export enum TaskStatus {
	PENDING = "pending",
	IN_PROGRESS = "in_progress",
	COMPLETED = "completed",
}
