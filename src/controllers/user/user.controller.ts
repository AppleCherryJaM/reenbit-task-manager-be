import type { Response } from "express";
import { prisma } from "../../lib/prisma";
import { type CreateUserRequest, UpdateUserInput, type UpdateUserRequest } from "./user.types";

class UserController {
	async getAllUsers(req: CreateUserRequest, res: Response) {
		try {
			const users = await prisma.user.findMany({
				select: {
					id: true,
					email: true,
					name: true,
					_count: {
						select: {
							authoredTasks: true,
							assignedTasks: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
			});
			res.status(200).json(users);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Error while fetching users" });
		}
	}

	async getUserById(req: UpdateUserRequest, res: Response) {
		const { id } = req.params;
		try {
			const user = await prisma.user.findUnique({
				where: { id: Number.parseInt(id) },
				select: {
					id: true,
					email: true,
					name: true,
					authoredTasks: {
						select: {
							id: true,
							title: true,
							status: true,
							createdAt: true,
							assignees: {
								select: {
									id: true,
									name: true,
									email: true,
								},
							},
						},
					},
					assignedTasks: {
						select: {
							id: true,
							title: true,
							status: true,
							createdAt: true,
							author: {
								select: {
									id: true,
									name: true,
									email: true,
								},
							},
						},
					},
					_count: {
						select: {
							authoredTasks: true,
							assignedTasks: true,
						},
					},
				},
			});

			if (!user) {
				return res.status(404).json({ error: "Cannot find user with this id" });
			}
			res.status(200).json(user);
		} catch (error) {
			console.error(`Error in getUserById method: ${error}`);
			res.status(500).json({ error: "Error in getUserById method" });
		}
	}

	async createUser(req: CreateUserRequest, res: Response) {
		const { name, email } = req.body;
		try {
			if (!email) {
				return res.status(400).json({ error: "Email is required" });
			}

			const user = await prisma.user.create({
				data: { email, name },
				select: {
					id: true,
					email: true,
					name: true,
					createdAt: true,
				},
			});

			res.status(201).json(user);
		} catch (error) {
			console.error("Error creating user:", error);

			if (error instanceof Error && error.message.includes("Unique constraint")) {
				return res.status(400).json({ error: "User with current email already exists" });
			}

			res.status(500).json({ error: "Error while user creation" });
		}
	}

	async updateUser(req: UpdateUserRequest, res: Response) {
		try {
			const { id } = req.params;
			const { email, name } = req.body;

			const user = await prisma.user.update({
				where: { id: Number.parseInt(id) },
				data: {
					...(email && { email }),
					...(name && { name }),
				},
				select: {
					id: true,
					email: true,
					name: true,
					createdAt: true,
				},
			});

			res.json(user);
		} catch (error) {
			console.error("Error updating user:", error);

			if (error instanceof Error && error.message.includes("Record to update not found")) {
				return res.status(404).json({ error: "Cannot find this user" });
			}

			res.status(500).json({ error: "Error while updating user" });
		}
	}

	async deleteUser(req: UpdateUserRequest, res: Response) {
		try {
			const { id } = req.params;

			await prisma.user.delete({
				where: { id: Number.parseInt(id) },
			});

			res.status(204).send();
		} catch (error) {
			console.error("Error deleting user:", error);

			if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
				return res.status(404).json({ error: "Cannot find this user" });
			}

			res.status(500).json({ error: "Error while deleting user" });
		}
	}

	async getUserTasks(req: UpdateUserRequest, res: Response) {
		try {
			const { id } = req.params;
			const { type } = req.query; // 'authored' | 'assigned'

			const whereCondition =
				type === "authored"
					? { authorId: Number.parseInt(id) }
					: type === "assigned"
						? { assignees: { some: { id: Number.parseInt(id) } } }
						: {
								OR: [
									{ authorId: Number.parseInt(id) },
									{ assignees: { some: { id: Number.parseInt(id) } } },
								],
							};

			const tasks = await prisma.task.findMany({
				where: whereCondition,
				include: {
					author: {
						select: { id: true, name: true, email: true },
					},
					assignees: {
						select: { id: true, name: true, email: true },
					},
				},
				orderBy: { createdAt: "desc" },
			});

			res.json(tasks);
		} catch (error) {
			console.error("Error fetching user tasks:", error);
			res.status(500).json({ error: "Error while getting user tasks" });
		}
	}
}

export default new UserController();
