import type { Response } from "express";
import { prisma } from "../../lib/prisma";
import { ErrorHandler } from "../../models/errors/ErrorHandler";
import type {
	CreateTaskRequest,
	TaskParamsRequest,
	UpdateTaskRequest,
	UserBasicInfo,
} from "./task.types";
import { TaskStatus } from "./task.types";

class TaskController {
	constructor() {
		this.getTasks = this.getTasks.bind(this);
		this.getTaskById = this.getTaskById.bind(this);
		this.createTask = this.createTask.bind(this);
		this.updateTask = this.updateTask.bind(this);
		this.deleteTask = this.deleteTask.bind(this);
	}

	private readonly taskIncludeConfig = {
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

	private async findTaskById(id: string): Promise<any> {
		return await prisma.task.findUnique({
			where: { id },
			include: this.taskIncludeConfig,
		});
	}

	async getTasks(req: CreateTaskRequest, res: Response): Promise<void> {
		try {
			const tasks = await prisma.task.findMany({
				include: this.taskIncludeConfig,
				orderBy: { createdAt: "desc" },
			});
			res.json(tasks);
		} catch (error) {
			ErrorHandler.handleAndSendError(error, res, "Error while getting tasks");
		}
	}

	async getTaskById(req: TaskParamsRequest, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const task = await this.findTaskById(id);

			if (!task) {
				res.status(404).json({ error: "Task not found" });
				return;
			}

			res.json(task);
		} catch (error) {
			ErrorHandler.handleAndSendError(error, res, "Error while getting task");
		}
	}

	async createTask(req: CreateTaskRequest, res: Response): Promise<void> {
		try {
			const { title, description, status, authorId, assigneeIds } = req.body;

			if (!title) {
				res.status(400).json({ error: "Title is required" });
				return;
			}
			if (!authorId) {
				res.status(400).json({ error: "Author ID is required" });
				return;
			}

			const task = await prisma.$transaction(async (tx) => {
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

				const taskData = {
					title,
					description: description || null,
					status: (status || TaskStatus.PENDING) as any,
					author: {
						connect: { id: authorId },
					},
					...(assigneeIds &&
						assigneeIds.length > 0 && {
							assignees: {
								connect: assigneeIds.map((id: string) => ({ id })),
							},
						}),
				};

				return await tx.task.create({
					data: taskData as any,
					include: this.taskIncludeConfig,
				});
			});

			res.status(201).json(task);
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("not found")) {
					res.status(404).json({ error: error.message });
					return;
				}
			}
			ErrorHandler.handleAndSendError(error, res, "Error while creating task");
		}
	}

	async updateTask(req: UpdateTaskRequest, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const { title, description, status, assigneeIds } = req.body;

			if (status && !this.isValidStatus(status)) {
				res.status(400).json({
					error: `Invalid status. Allowed values: ${Object.values(TaskStatus).join(", ")}`,
				});
				return;
			}

			const task = await prisma.$transaction(async (tx) => {
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

				if (title) updateData.title = title;
				if (description !== undefined) updateData.description = description;
				if (status) updateData.status = status as any;

				if (assigneeIds) {
					updateData.assignees = {
						set: assigneeIds.map((id: string) => ({ id })),
					};
				}

				return await tx.task.update({
					where: { id },
					data: updateData as any,
					include: this.taskIncludeConfig,
				});
			});

			res.json(task);
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("not found")) {
					res.status(404).json({ error: error.message });
					return;
				}
			}
			ErrorHandler.handleAndSendError(error, res, "Error while updating task");
		}
	}

	async deleteTask(req: TaskParamsRequest, res: Response): Promise<void> {
		try {
			await prisma.$transaction(async (tx) => {
				const taskExists = await tx.task.findUnique({
					where: { id: req.params.id },
					select: { id: true },
				});

				if (!taskExists) {
					throw new Error("Task not found");
				}

				await tx.task.delete({
					where: { id: req.params.id },
				});
			});

			res.status(204).send();
		} catch (error) {
			if (error instanceof Error && error.message.includes("not found")) {
				res.status(404).json({ error: error.message });
				return;
			}
			ErrorHandler.handleAndSendError(error, res, "Error while deleting task");
		}
	}
}

export const taskController = new TaskController();
export default taskController;
