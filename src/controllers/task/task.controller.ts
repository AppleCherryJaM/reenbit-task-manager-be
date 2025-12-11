import type { Response } from "express";

import { prisma } from "@/lib/prisma";

import { TaskErrorMessages, UNKNOWN_ERROR } from "@/models/errors/ErrorMessages";
import { getNumberParam } from "@/utils/task/task.utils";
import { BaseController } from "../base.controller";
import {
	BulkCreateTaskRequest,
	type CreateTaskRequest,
	type GetTasksRequest,
	type TaskRequest,
	TaskStatus,
	type UpdateTaskRequest,
} from "./task.types";

const limit = 50;

class TaskController {
	private static readonly taskIncludeConfig = {
		author: {
			select: {
				id: true,
				name: true,
				email: true,
			},
		},
		assignees: {
			select: {
				id: true,
				name: true,
				email: true,
			},
		},
	};

	private static readonly priorityMap = {
		low: "Low",
		medium: "Medium",
		high: "High",
	} as const;

	private static isValidStatus(status: string): boolean {
		return Object.values(TaskStatus).includes(status as TaskStatus);
	}

	private static getStringParam(param: string | string[] | undefined): string | undefined {
		if (!param) return undefined;

		return Array.isArray(param) ? param[0] : param;
	}

	async getTasks(req: GetTasksRequest, res: Response): Promise<void> {
		try {
			const status = TaskController.getStringParam(req.query.status);
			const priority = TaskController.getStringParam(req.query.priority);
			const authorId = TaskController.getStringParam(req.query.authorId);
			const assigneeId = TaskController.getStringParam(req.query.assigneeId);
			const search = TaskController.getStringParam(req.query.search);
			const sortBy = TaskController.getStringParam(req.query.sortBy) || "createdAt";
			const sortOrder = TaskController.getStringParam(req.query.sortOrder) || "desc";
			const startDate = TaskController.getStringParam(req.query.startDate);
			const endDate = TaskController.getStringParam(req.query.endDate);

			const pageNum = getNumberParam(req.query.page, 1);
			const limitNum = getNumberParam(req.query.limit, 10);

			const where: any = {};

			if (status && TaskController.isValidStatus(status)) {
				where.status = status;
			}

			if (priority && priority.toLowerCase() in TaskController.priorityMap) {
				where.priority =
					TaskController.priorityMap[
						priority.toLowerCase() as keyof typeof TaskController.priorityMap
					];
			}

			if (authorId) {
				where.authorId = authorId;
			}

			if (assigneeId) {
				where.assignees = {
					some: { id: assigneeId },
				};
			}

			if (search) {
				where.OR = [
					{ title: { contains: search, mode: "insensitive" } },
					{ description: { contains: search, mode: "insensitive" } },
				];
			}

			if (startDate || endDate) {
				where.createdAt = {};
				if (startDate) {
					const date = new Date(startDate);
					if (!isNaN(date.getTime())) {
						where.createdAt.gte = date;
					}
				}
				if (endDate) {
					const date = new Date(endDate);
					if (!isNaN(date.getTime())) {
						where.createdAt.lte = date;
					}
				}
			}

			const orderBy: any = {};
			const validSortFields = ["title", "priority", "deadline", "updatedAt", "createdAt"];

			if (validSortFields.includes(sortBy)) {
				orderBy[sortBy] = sortOrder;
			} else {
				orderBy.createdAt = sortOrder;
			}

			const skip = (pageNum - 1) * limitNum;

			const [total, tasks] = await Promise.all([
				prisma.task.count({ where }),
				prisma.task.findMany({
					where,
					include: TaskController.taskIncludeConfig,
					orderBy,
					skip,
					take: limitNum,
				}),
			]);

			BaseController.sendSuccess(res, {
				tasks,
				pagination: {
					total,
					page: pageNum,
					limit: limitNum,
					totalPages: Math.ceil(total / limitNum),
					hasNext: pageNum < Math.ceil(total / limitNum),
					hasPrev: pageNum > 1,
				},
			});
		} catch (error) {
			BaseController.sendError(res, TaskErrorMessages.GET_TASK_ERROR, error);
		}
	}

	async getTaskById(req: TaskRequest, res: Response): Promise<void> {
		const { id } = req.params;

		await BaseController.handleRequest(
			res,
			async () => {
				const task = await prisma.task.findUnique({
					where: { id },
					include: TaskController.taskIncludeConfig,
				});

				if (!task) {
					BaseController.sendNotFound(res, TaskErrorMessages.TASK_NOT_FOUND);
					return null;
				}

				return task;
			},
			TaskErrorMessages.GET_TASK_ERROR
		);
	}

	async createTask(req: CreateTaskRequest, res: Response): Promise<void> {
		const { title, description, status, priority, deadline, authorId, assigneeIds } = req.body;

		if (!title || !authorId) {
			BaseController.sendBadRequest(res, "Title and author ID are required");
			return;
		}

		await BaseController.handleRequest(
			res,
			async () => {
				return await prisma.$transaction(async (tx) => {
					await TaskController.validateUsersExist(tx, authorId, assigneeIds);

					let deadlineDate = null;

					if (deadline && deadline.trim() !== "") {
						deadlineDate = new Date(deadline);
						if (isNaN(deadlineDate.getTime())) {
							throw new Error("Invalid deadline format");
						}
					}

					const taskData = {
						title,
						description: description || null,
						status: (status || TaskStatus.PENDING) as any,
						author: { connect: { id: authorId } },
						priority: TaskController.priorityMap[
							(priority || "medium").toLowerCase() as keyof typeof TaskController.priorityMap
						] as any,
						deadline: deadlineDate,
						...(assigneeIds &&
							assigneeIds.length > 0 && {
								assignees: {
									connect: assigneeIds.map((id: string) => ({ id })),
								},
							}),
					};

					return await tx.task.create({
						data: taskData as any,
						include: TaskController.taskIncludeConfig,
					});
				});
			},
			TaskErrorMessages.CREATE_TASK_ERROR
		);
	}

	async createTasksBulk(req: BulkCreateTaskRequest, res: Response): Promise<void> {
		const { tasks } = req.body;

		if (!Array.isArray(tasks) || tasks.length === 0) {
			BaseController.sendBadRequest(res, TaskErrorMessages.ARRAY_IS_REQUIRED);
			return;
		}

		if (tasks.length > limit) {
			BaseController.sendBadRequest(res, TaskErrorMessages.BATCH_LIMIT);
			return;
		}

		await BaseController.handleRequest(
			res,
			async () => {
				const results = [];
				const errors = [];

				for (const taskData of tasks) {
					try {

						if (!taskData.title || !taskData.authorId) {
							errors.push({ task: taskData, error: TaskErrorMessages.REQUIRED_FIELDS });
							continue;
						}

						const task = await prisma.task.create({
							data: {
								title: taskData.title,
								description: taskData.description || null,
								status: (taskData.status || TaskStatus.PENDING) as any,
								priority: TaskController.priorityMap[
									(taskData.priority || "medium").toLowerCase() as keyof typeof TaskController.priorityMap
								] as any,
								deadline: taskData.deadline && taskData.deadline.trim() !== '' 
									? new Date(taskData.deadline) 
									: null,
								author: { connect: { id: taskData.authorId } },
								...(taskData.assigneeIds && taskData.assigneeIds.length > 0 && {
									assignees: {
										connect: taskData.assigneeIds.map((id: string) => ({ id })),
									},
								}),
							},
							include: TaskController.taskIncludeConfig,
						});

						results.push(task);
					} catch (error) {
						errors.push({ 
							task: taskData, 
							error: error instanceof Error ? error.message : UNKNOWN_ERROR 
						});
					}
				}

				return {
					success: results,
					errors,
					total: tasks.length,
					created: results.length,
					failed: errors.length,
				};
			},
			TaskErrorMessages.BATCH_TASK_FAILURE
		);
	}

	private static async validateUsersExist(
		tx: any,
		authorId: string,
		assigneeIds?: string[]
	): Promise<void> {
		const authorExists = await tx.user.findUnique({
			where: { id: authorId },
			select: { id: true },
		});

		if (!authorExists) {
			throw new Error(TaskErrorMessages.AUTHOR_NOT_FOUND);
		}

		if (assigneeIds && assigneeIds.length > 0) {
			const assigneesCount = await tx.user.count({
				where: { id: { in: assigneeIds } },
			});

			if (assigneesCount !== assigneeIds.length) {
				throw new Error(TaskErrorMessages.ASSIGNEES_NOT_FOUND);
			}
		}
	}

	async updateTask(req: UpdateTaskRequest, res: Response): Promise<void> {
		const { id } = req.params;
		const { title, description, status, priority, deadline, assigneeIds } = req.body;

		if (status && !TaskController.isValidStatus(status)) {
			BaseController.sendBadRequest(
				res,
				`Invalid status. Allowed values: ${Object.values(TaskStatus).join(", ")}`
			);
			return;
		}

		await BaseController.handleRequest(
			res,
			async () => {
				return await prisma.$transaction(async (tx) => {
					const taskExists = await tx.task.findUnique({
						where: { id },
						select: { id: true },
					});

					if (!taskExists) {
						throw new Error(TaskErrorMessages.TASK_NOT_FOUND);
					}

					if (assigneeIds) {
						const assigneesCount = await tx.user.count({
							where: { id: { in: assigneeIds } },
						});

						if (assigneesCount !== assigneeIds.length) {
							throw new Error(TaskErrorMessages.ASSIGNEES_NOT_FOUND);
						}
					}

					const updateData: any = {};

					if (title) {
						updateData.title = title;
					}

					if (description !== undefined && description !== null) {
						updateData.description = description;
					}

					if (status) {
						updateData.status = status as any;
					}

					if (priority) {
						updateData.priority = TaskController.priorityMap[
							(priority || "medium").toLowerCase() as keyof typeof TaskController.priorityMap
						] as any;
					}

					if (deadline !== undefined) {
						if (deadline === null || deadline === "") {
							updateData.deadline = null;
						} else if (deadline.trim() !== "") {
							const deadlineDate = new Date(deadline);
							if (isNaN(deadlineDate.getTime())) {
								throw new Error("Invalid deadline format");
							}
							updateData.deadline = deadlineDate;
						}
					}

					if (assigneeIds) {
						updateData.assignees = {
							set: assigneeIds.map((id: string) => ({ id })),
						};
					}

					return await tx.task.update({
						where: { id },
						data: updateData as any,
						include: TaskController.taskIncludeConfig,
					});
				});
			},
			TaskErrorMessages.UPDATE_TASK_ERROR
		);
	}

	async deleteTask(req: TaskRequest, res: Response): Promise<void> {
		const { id } = req.params;

		await BaseController.handleRequest(
			res,
			async () => {
				await prisma.$transaction(async (tx) => {
					const taskExists = await tx.task.findUnique({
						where: { id },
						select: { id: true },
					});

					if (!taskExists) {
						throw new Error(TaskErrorMessages.TASK_NOT_FOUND);
					}

					await tx.task.delete({
						where: { id },
					});
				});

				return { message: "Task deleted successfully" };
			},
			TaskErrorMessages.DELETE_TASK_ERROR
		);
	}
}

export const taskController = new TaskController();
export default taskController;
