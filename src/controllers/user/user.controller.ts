import type { Response } from "express";

import { BaseController } from "../base.controller";
import type { CreateUserRequest, UpdateUserRequest, UserTasksType } from "./user.types";

import { ErrorHandler } from "@/models/errors/ErrorHandler";
import { RefreshTokenErrorMessages, UserErrorMessages } from "@/models/errors/ErrorMessages";
import { authService } from "@/services/auth/auth.service";
import { userService } from "@/services/user/user.service";
import type {
	AuthRequest,
	LoginRequest,
	LogoutRequest,
	RefreshTokenRequest,
	RegisterRequest,
} from "@/utils/auth/auth.types";

class UserController {
	async getAllUsers(req: CreateUserRequest, res: Response): Promise<void> {
		await BaseController.handleRequest(
			res,
			() => userService.getAllUsers(),
			UserErrorMessages.FETCH_USER_ERROR
		);
	}

	async getUserById(req: UpdateUserRequest, res: Response): Promise<void> {
		const { id } = req.params;

		await BaseController.handleRequest(
			res,
			async () => {
				const user = await userService.getUserById(id);
				if (!user) {
					BaseController.sendNotFound(res, UserErrorMessages.USER_NOT_FOUND);
					return null;
				}
				return user;
			},
			UserErrorMessages.FETCH_USER_ERROR
		);
	}

	async register(req: RegisterRequest, res: Response): Promise<void> {
		await BaseController.handleRequest(
			res,
			() => authService.register(req.body),
			UserErrorMessages.CREATE_USER_ERROR
		);
	}

	async login(req: LoginRequest, res: Response): Promise<void> {
		await BaseController.handleRequest(
			res,
			() => authService.login(req.body),
			UserErrorMessages.LOGIN_USER_ERROR
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
					BaseController.sendNotFound(res, UserErrorMessages.USER_NOT_FOUND);
					return null;
				}
				return await userService.updateUser(id, { email, name });
			},
			UserErrorMessages.UPDATE_USER_ERROR
		);
	}

	async deleteUser(req: UpdateUserRequest, res: Response): Promise<void> {
		const { id } = req.params;

		await BaseController.handleRequest(
			res,
			async () => {
				const userExists = await userService.userExists(id);
				if (!userExists) {
					BaseController.sendNotFound(res, UserErrorMessages.USER_NOT_FOUND);
					return null;
				}
				await userService.deleteUser(id);
				return { message: "User deleted successfully" };
			},
			UserErrorMessages.DELETE_USER_ERROR
		);
	}

	async getUserTasks(req: UpdateUserRequest, res: Response): Promise<void> {
		const { id } = req.params;
		const { type } = req.query as { type?: UserTasksType };

		await BaseController.handleRequest(
			res,
			() => userService.getUserTasks(id, type),
			UserErrorMessages.GET_USER_TASK_ERROR
		);
	}

	async getProfile(req: AuthRequest, res: Response): Promise<void> {
		try {
			if (!req.user) {
				BaseController.sendUnauthorized(res, UserErrorMessages.USER_NOT_AUTHENTICATED);
				return;
			}

			const user = await userService.getUserById(req.user.userId);
			if (!user) {
				BaseController.sendNotFound(res, UserErrorMessages.USER_NOT_FOUND);
				return;
			}

			res.status(200).json(user);
		} catch (error) {
			ErrorHandler.handleAndSendError(error, res, UserErrorMessages.FETCH_USER_ERROR);
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
			RefreshTokenErrorMessages.REFRESH_TOKEN_ERROR
		);
	}

	async logout(req: LogoutRequest, res: Response): Promise<void> {
		const { refreshToken } = req.body;

		if (!refreshToken) {
			BaseController.sendBadRequest(res, RefreshTokenErrorMessages.REQUIRED_REFRESH_TOKEN);
			return;
		}

		await BaseController.handleRequest(
			res,
			async () => {
				await authService.logout(refreshToken);
				return { message: "Successfully logged out" };
			},
			UserErrorMessages.LOGOUT_USER_ERROR
		);
	}

	async logoutAll(req: AuthRequest, res: Response): Promise<void> {
		try {
			if (!req.user) {
				BaseController.sendUnauthorized(res);
				return;
			}

			await authService.logoutAll(req.user.userId);
			res.status(200).json({ message: "Successfully logged out from all devices" });
		} catch (error) {
			ErrorHandler.handleAndSendError(error, res, UserErrorMessages.LOGOUT_USER_ERROR);
		}
	}
}

export const userController = new UserController();
export default userController;
