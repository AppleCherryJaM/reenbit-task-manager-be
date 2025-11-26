// user.controller.ts
import type { Response } from "express";
import { ErrorHandler } from "../../models/errors/ErrorHandler";
import { authService } from "../../services/auth/auth.service";
import { userService } from "../../services/user/user.service";
import type {
	AuthRequest,
	LoginRequest,
	LogoutRequest,
	RefreshTokenRequest,
	RegisterRequest,
} from "../../utils/auth/auth.types";
import { BaseController } from "../base.controller";
import type { CreateUserRequest, UpdateUserRequest } from "./user.types";

class UserController {
	async getAllUsers(req: CreateUserRequest, res: Response): Promise<void> {
		await BaseController.handleRequest(
			res,
			() => userService.getAllUsers(),
			"Error while fetching users"
		);
	}

	async getUserById(req: UpdateUserRequest, res: Response): Promise<void> {
		const { id } = req.params;

		await BaseController.handleRequest(
			res,
			async () => {
				const user = await userService.getUserById(id);
				if (!user) {
					BaseController.sendNotFound(res, "Cannot find user with this id");
					return null;
				}
				return user;
			},
			"Error while fetching user"
		);
	}

	async register(req: RegisterRequest, res: Response): Promise<void> {
		await BaseController.handleRequest(
			res,
			() => authService.register(req.body),
			"Error while creating user"
		);
	}

	async login(req: LoginRequest, res: Response): Promise<void> {
		await BaseController.handleRequest(
			res,
			() => authService.login(req.body),
			"Error while logging in"
		);
	}

	async updateUser(req: UpdateUserRequest, res: Response): Promise<void> {
		const { id } = req.params;
		const { email, name } = req.body;

		await BaseController.handleRequest(
			res,
			async () => {
				const userExists = await userService.userExists(id);
				if (!userExists) {
					BaseController.sendNotFound(res, "Cannot find this user");
					return null;
				}
				return await userService.updateUser(id, { email, name });
			},
			"Error while updating user"
		);
	}

	async deleteUser(req: UpdateUserRequest, res: Response): Promise<void> {
		const { id } = req.params;

		await BaseController.handleRequest(
			res,
			async () => {
				const userExists = await userService.userExists(id);
				if (!userExists) {
					BaseController.sendNotFound(res, "Cannot find this user");
					return null;
				}
				await userService.deleteUser(id);
				return { message: "User deleted successfully" };
			},
			"Error while deleting user"
		);
	}

	async getUserTasks(req: UpdateUserRequest, res: Response): Promise<void> {
		const { id } = req.params;
		const { type } = req.query as { type?: "authored" | "assigned" };

		await BaseController.handleRequest(
			res,
			() => userService.getUserTasks(id, type),
			"Error while getting user tasks"
		);
	}

	async getProfile(req: AuthRequest, res: Response): Promise<void> {
		try {
			if (!req.user) {
				BaseController.sendUnauthorized(res, "User not authenticated");
				return;
			}

			const user = await userService.getUserById(req.user.userId);
			if (!user) {
				BaseController.sendNotFound(res, "User not found");
				return;
			}

			res.status(200).json(user);
		} catch (error) {
			ErrorHandler.handleAndSendError(error, res, "Error while fetching profile");
		}
	}

	async refreshToken(req: RefreshTokenRequest, res: Response): Promise<void> {
		const { refreshToken } = req.body;

		if (!refreshToken) {
			BaseController.sendBadRequest(res, "Refresh token is required");
			return;
		}

		await BaseController.handleRequest(
			res,
			() => authService.refreshToken(refreshToken),
			"Error while refreshing token"
		);
	}

	async logout(req: LogoutRequest, res: Response): Promise<void> {
		const { refreshToken } = req.body;

		if (!refreshToken) {
			BaseController.sendBadRequest(res, "Refresh token is required");
			return;
		}

		await BaseController.handleRequest(
			res,
			async () => {
				await authService.logout(refreshToken);
				return { message: "Successfully logged out" };
			},
			"Error while logging out"
		);
	}

	async logoutAll(req: AuthRequest, res: Response): Promise<void> {
		try {
			if (!req.user) {
				BaseController.sendUnauthorized(res, "User not authenticated");
				return;
			}

			await authService.logoutAll(req.user.userId);
			res.status(200).json({ message: "Successfully logged out from all devices" });
		} catch (error) {
			ErrorHandler.handleAndSendError(error, res, "Error while logging out from all devices");
		}
	}
}

export const userController = new UserController();
export default userController;
