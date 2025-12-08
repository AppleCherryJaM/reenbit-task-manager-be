import type { Request } from "express";
import type { ParsedQs } from "qs";

export interface TaskCreateData {
	title: string;
	description?: string;
	status?: TaskStatus;
	priority?: "low" | "medium" | "high";
	deadline?: string | null;
	authorId: string;
	assigneeIds?: string[];
}

export interface TaskUpdateData {
	title?: string;
	description?: string | null;
	status?: TaskStatus;
	priority?: "low" | "medium" | "high";
	deadline?: string | null;
	assigneeIds?: string[];
}

export interface TaskQueryParams extends ParsedQs {
	status?: TaskStatus | string;
	priority?: "low" | "medium" | "high" | string;
	authorId?: string;
	assigneeId?: string;
	search?: string;
	sortBy?: "createdAt" | "updatedAt" | "title" | "priority" | "deadline" | string;
	sortOrder?: "asc" | "desc" | string;
	page?: string | string[];
	limit?: string | string[];
	startDate?: string;
	endDate?: string;
	[key: string]: any;
}

export interface TaskRequest extends Request {
	params: { id: string };
}

export interface CreateTaskRequest extends Request {
	body: TaskCreateData;
}

export interface UpdateTaskRequest extends TaskRequest {
	body: TaskUpdateData;
}

export interface GetTasksRequest extends Request<{}, any, any, TaskQueryParams> {}

export enum TaskStatus {
	PENDING = "pending",
	IN_PROGRESS = "in_progress",
	COMPLETED = "completed",
}

export enum TaskPriority {
	LOW = "low",
	MEDIUM = "medium",
	HIGH = "high",
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
	priority: string;
	deadline: Date | null;
	authorId: string;
	createdAt: Date;
	updatedAt: Date;
	author: UserBasicInfo;
	assignees: UserBasicInfo[];
}

export enum priorityMap {
	low = "Low",
	medium = "Medium",
	high = "High",
}
