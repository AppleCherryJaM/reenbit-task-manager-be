// task.controller.ts
import type { Response } from "express";
import { prisma } from "../../lib/prisma";
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

	private isValidStatus(status: string): boolean {
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
			"Error while getting tasks"
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
					BaseController.sendNotFound(res, "Task not found");
					return null;
				}

				return task;
			},
			"Error while getting task"
		);
	}

	async createTask(req: CreateTaskRequest, res: Response): Promise<void> {
		const { title, description, status, authorId, assigneeIds } = req.body;

		if (!title || !authorId) {
			BaseController.sendBadRequest(res, "Title and author ID are required");
			return;
		}

		await BaseController.handleRequest(
			res,
			async () => {
				return await prisma.$transaction(async (tx) => {
					await this.validateUsersExist(tx, authorId, assigneeIds);

					const taskData = {
						title,
						description: description || null,
						status: (status || TaskStatus.PENDING) as any,
						author: { connect: { id: authorId } },
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
			"Error while creating task"
		);
	}

	private async validateUsersExist(
		tx: any,
		authorId: string,
		assigneeIds?: string[]
	): Promise<void> {
		const authorExists = await tx.user.findUnique({
			where: { id: authorId },
			select: { id: true },
		});

		if (!authorExists) {
			throw new Error("Author not found");
		}

		if (assigneeIds && assigneeIds.length > 0) {
			const assigneesCount = await tx.user.count({
				where: { id: { in: assigneeIds } },
			});

			if (assigneesCount !== assigneeIds.length) {
				throw new Error("One or more assignees not found");
			}
		}
	}

	async updateTask(req: UpdateTaskRequest, res: Response): Promise<void> {
		const { id } = req.params;
		const { title, description, status, assigneeIds } = req.body;

		if (status && !this.isValidStatus(status)) {
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
						throw new Error("Task not found");
					}

					if (assigneeIds) {
						const assigneesCount = await tx.user.count({
							where: { id: { in: assigneeIds } },
						});

						if (assigneesCount !== assigneeIds.length) {
							throw new Error("One or more assignees not found");
						}
					}

					const updateData: any = {};
					if (title) { updateData.title = title; }
					if (description !== undefined) { updateData.description = description; }
					if (status) { updateData.status = status as any; }

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
			"Error while updating task"
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
						throw new Error("Task not found");
					}

					await tx.task.delete({
						where: { id },
					});
				});

				return { message: "Task deleted successfully" };
			},
			"Error while deleting task"
		);
	}
}

export const taskController = new TaskController();
export default taskController;
