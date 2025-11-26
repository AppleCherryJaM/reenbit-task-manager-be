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
import type { CreateUserRequest, UpdateUserRequest } from "./user.types";

class UserController {
	async getAllUsers(req: CreateUserRequest, res: Response): Promise<void> {
		try {
			const users = await userService.getAllUsers();
			res.status(200).json(users);
		} catch (error) {
			ErrorHandler.handleAndSendError(error, res, "Error while fetching users");
		}
	}

	async getUserById(req: UpdateUserRequest, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const user = await userService.getUserById(id);

			if (!user) {
				res.status(404).json({ error: "Cannot find user with this id" });
				return;
			}

			res.status(200).json(user);
		} catch (error) {
			ErrorHandler.handleAndSendError(error, res, "Error while fetching user");
		}
	}

	async register(req: RegisterRequest, res: Response): Promise<void> {
		try {
			const { name, email, password } = req.body;

			if (!email || !password) {
				res.status(400).json({ error: "Email and password are required" });
				return;
			}

			if (password.length < 6) {
				res.status(400).json({ error: "Password must be at least 6 characters long" });
				return;
			}

			const result = await authService.register({ name, email, password });
			res.status(201).json(result);
		} catch (error) {
			if (error instanceof Error && error.message.includes("already exists")) {
				res.status(400).json({ error: error.message });
				return;
			}
			ErrorHandler.handleAndSendError(error, res, "Error while creating user");
		}
	}

	async login(req: LoginRequest, res: Response): Promise<void> {
		try {
			const { email, password } = req.body;

			if (!email || !password) {
				res.status(400).json({ error: "Email and password are required" });
				return;
			}

			const result = await authService.login({ email, password });
			res.status(200).json(result);
		} catch (error) {
			if (error instanceof Error && error.message.includes("Invalid email or password")) {
				res.status(401).json({ error: error.message });
				return;
			}
			ErrorHandler.handleAndSendError(error, res, "Error while logging in");
		}
	}

	async updateUser(req: UpdateUserRequest, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const { email, name } = req.body;

			const userExists = await userService.userExists(id);
			if (!userExists) {
				res.status(404).json({ error: "Cannot find this user" });
				return;
			}

			const user = await userService.updateUser(id, { email, name });
			res.json(user);
		} catch (error) {
			ErrorHandler.handleAndSendError(error, res, "Error while updating user");
		}
	}

	async deleteUser(req: UpdateUserRequest, res: Response): Promise<void> {
		try {
			const { id } = req.params;

			const userExists = await userService.userExists(id);
			if (!userExists) {
				res.status(404).json({ error: "Cannot find this user" });
				return;
			}

			await userService.deleteUser(id);
			res.status(204).send();
		} catch (error) {
			ErrorHandler.handleAndSendError(error, res, "Error while deleting user");
		}
	}

	async getUserTasks(req: UpdateUserRequest, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const { type } = req.query as { type?: "authored" | "assigned" };

			const tasks = await userService.getUserTasks(id, type);
			res.json(tasks);
		} catch (error) {
			ErrorHandler.handleAndSendError(error, res, "Error while getting user tasks");
		}
	}

	async getProfile(req: AuthRequest, res: Response): Promise<void> {
		try {
			if (!req.user) {
				res.status(401).json({ error: "User not authenticated" });
				return;
			}

			const user = await userService.getUserById(req.user.userId);
			if (!user) {
				res.status(404).json({ error: "User not found" });
				return;
			}

			res.status(200).json(user);
		} catch (error) {
			ErrorHandler.handleAndSendError(error, res, "Error while fetching profile");
		}
	}

	async refreshToken(req: RefreshTokenRequest, res: Response): Promise<void> {
		try {
			const { refreshToken } = req.body;

			if (!refreshToken) {
				res.status(400).json({ error: "Refresh token is required" });
				return;
			}

			const result = await authService.refreshToken(refreshToken);
			res.status(200).json(result);
		} catch (error) {
			if (
				error instanceof Error &&
				(error.message.includes("invalid token") ||
					error.message.includes("jwt expired") ||
					error.message.includes("Invalid refresh token"))
			) {
				res.status(403).json({ error: "Invalid or expired refresh token" });
				return;
			}

			ErrorHandler.handleAndSendError(error, res, "Error while refreshing token");
		}
	}

	async logout(req: LogoutRequest, res: Response): Promise<void> {
		try {
			const { refreshToken } = req.body;

			if (!refreshToken) {
				res.status(400).json({ error: "Refresh token is required" });
				return;
			}

			await authService.logout(refreshToken);

			res.status(200).json({ message: "Successfully logged out" });
		} catch (error) {
			if (error instanceof Error && error.message.includes("Refresh token")) {
				res.status(400).json({ error: error.message });
				return;
			}
			ErrorHandler.handleAndSendError(error, res, "Error while logging out");
		}
	}

	async logoutAll(req: AuthRequest, res: Response): Promise<void> {
		try {
			if (!req.user) {
				res.status(401).json({ error: "User not authenticated" });
				return;
			}

			await authService.logoutAll(req.user.userId);

			res.status(200).json({ message: "Successfully logged out from all devices" });
		} catch (error) {
			ErrorHandler.handleAndSendError(error, res, "Error while logging out from all devices");
		}
	}
}

export default new UserController();
