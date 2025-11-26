// services/user/user.service.ts
import { prisma } from "../../lib/prisma";

export interface UserProfile {
	id: string;
	email: string;
	name: string | null;
	createdAt: Date;
	_count?: {
		authoredTasks: number;
		assignedTasks: number;
	};
}

export interface UserWithTasks extends UserProfile {
	authoredTasks: Array<{
		id: string;
		title: string;
		status: string;
		createdAt: Date;
		assignees: Array<{
			id: string;
			name: string | null;
			email: string;
		}>;
	}>;
	assignedTasks: Array<{
		id: string;
		title: string;
		status: string;
		createdAt: Date;
		author: {
			id: string;
			name: string | null;
			email: string;
		};
	}>;
}

const userSelect = {
	id: true,
	email: true,
	name: true,
	createdAt: true,
} as const;

export class UserService {
	async getAllUsers(): Promise<UserProfile[]> {
		return await prisma.user.findMany({
			select: {
				...userSelect,
				_count: {
					select: {
						authoredTasks: true,
						assignedTasks: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});
	}

	async getUserById(id: string): Promise<UserWithTasks | null> {
		return await prisma.user.findUnique({
			where: { id },
			select: {
				...userSelect,
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
	}

	async createUser(data: { email: string; name?: string; password: string }): Promise<UserProfile> {
		return await prisma.user.create({
			data,
			select: userSelect,
		});
	}

	async updateUser(id: string, data: { email?: string; name?: string }): Promise<UserProfile> {
		return await prisma.user.update({
			where: { id },
			data,
			select: userSelect,
		});
	}

	async deleteUser(id: string): Promise<void> {
		await prisma.user.delete({
			where: { id },
		});
	}

	async findUserByEmail(email: string) {
		return await prisma.user.findUnique({
			where: { email },
		});
	}

	async getUserTasks(userId: string, type?: "authored" | "assigned") {
		const whereCondition = this.buildTasksWhereCondition(userId, type);

		return await prisma.task.findMany({
			where: whereCondition,
			include: {
				author: { select: { id: true, name: true, email: true } },
				assignees: { select: { id: true, name: true, email: true } },
			},
			orderBy: { createdAt: "desc" },
		});
	}

	private buildTasksWhereCondition(userId: string, type?: "authored" | "assigned") {
		switch (type) {
			case "authored":
				return { authorId: userId };
			case "assigned":
				return { assignees: { some: { id: userId } } };
			default:
				return {
					OR: [{ authorId: userId }, { assignees: { some: { id: userId } } }],
				};
		}
	}

	async userExists(id: string): Promise<boolean> {
		const user = await prisma.user.findUnique({
			where: { id },
			select: { id: true },
		});
		return !!user;
	}
}

export const userService = new UserService();
