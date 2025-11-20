import { Request } from 'express';

// Core data interfaces
export interface TaskCreateData {
  title: string;
  description?: string;
  status?: string;
  authorId: number;
  assigneeIds?: number[];
}

export interface TaskUpdateData {
  title?: string;
  description?: string;
  status?: string;
  assigneeIds?: number[];
}

export interface AssigneeOperationData {
  userId: number;
}

// Response interfaces
export interface UserBasicInfo {
  id: number;
  name: string | null;
  email: string;
}

export interface TaskWithRelations {
  id: number;
  title: string;
  description: string | null;
  status: string;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
  author: UserBasicInfo;
  assignees: UserBasicInfo[];
}

// Extended Request types
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

// Aliases for compatibility
export type TaskResponse = Omit<TaskWithRelations, 'author' | 'assignees'>;