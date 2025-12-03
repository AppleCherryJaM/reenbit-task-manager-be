import type { Response } from "express";

import { prisma } from "@/lib/prisma";

import { TaskErrorMessages } from "@/models/errors/ErrorMessages";
import { BaseController } from "../base.controller";
import type { CreateTaskRequest, TaskRequest, UpdateTaskRequest } from "./task.types";
import { TaskStatus } from "./task.types";

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

	async getTasks(req: CreateTaskRequest, res: Response): Promise<void> {
		await BaseController.handleRequest(
			res,
			() =>
				prisma.task.findMany({
					include: TaskController.taskIncludeConfig,
					orderBy: { createdAt: "desc" },
				}),
			TaskErrorMessages.GET_TASK_ERROR
		);
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
