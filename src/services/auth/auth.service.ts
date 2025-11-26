import type { AuthResponse } from "../../utils/auth/auth.types";
import { AuthUtils } from "../../utils/auth/auth.utils";
import { refreshTokenService } from "../refresh-token/refresh-token.service";
import { userService } from "../user/user.service";

export class AuthService {
	async register(userData: {
		name?: string;
		email: string;
		password: string;
	}): Promise<AuthResponse> {
		const { name, email, password } = userData;

		const existingUser = await userService.findUserByEmail(email);
		if (existingUser) {
			throw new Error("User with this email already exists");
		}

		const hashedPassword = await AuthUtils.hashPassword(password);

		const user = await userService.createUser({
			email,
			name,
			password: hashedPassword,
		});

		const accessToken = AuthUtils.generateAccessToken({
			userId: user.id,
			email: user.email,
		});

		const refreshToken = AuthUtils.generateRefreshToken({
			userId: user.id,
			email: user.email,
		});

		// Сохраняем refresh token в базе
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7); // 7 дней
		await refreshTokenService.saveRefreshToken(user.id, refreshToken, expiresAt);

		return {
			user,
			accessToken,
			refreshToken,
		};
	}

	async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
		const { email, password } = credentials;

		const user = await userService.findUserByEmail(email);
		if (!user) {
			throw new Error("Invalid email or password");
		}

		const isPasswordValid = await AuthUtils.verifyPassword(password, user.password);
		if (!isPasswordValid) {
			throw new Error("Invalid email or password");
		}

		const accessToken = AuthUtils.generateAccessToken({
			userId: user.id,
			email: user.email,
		});

		const refreshToken = AuthUtils.generateRefreshToken({
			userId: user.id,
			email: user.email,
		});

		// Сохраняем refresh token в базе
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7); // 7 дней
		await refreshTokenService.saveRefreshToken(user.id, refreshToken, expiresAt);

		return {
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
			},
			accessToken,
			refreshToken,
		};
	}

	async refreshToken(refreshToken: string): Promise<{
		accessToken: string;
		refreshToken: string;
		user: { id: string; email: string; name: string | null };
	}> {
		if (!refreshToken) {
			throw new Error("Refresh token is required");
		}

		// Проверяем что токен есть в базе и не отозван
		const storedToken = await refreshTokenService.findRefreshToken(refreshToken);
		if (!storedToken) {
			throw new Error("Invalid refresh token");
		}

		// Проверяем не истек ли токен
		if (storedToken.expiresAt < new Date()) {
			// Удаляем просроченный токен
			await refreshTokenService.revokeRefreshToken(refreshToken);
			throw new Error("Refresh token expired");
		}

		const decoded = AuthUtils.verifyRefreshToken(refreshToken);

		const user = await userService.getUserById(decoded.userId);

		if (!user) {
			throw new Error("Invalid refresh token");
		}

		// Отзываем старый токен
		await refreshTokenService.revokeRefreshToken(refreshToken);

		const newAccessToken = AuthUtils.generateAccessToken({
			userId: user.id,
			email: user.email,
		});

		const newRefreshToken = AuthUtils.generateRefreshToken({
			userId: user.id,
			email: user.email,
		});

		// Сохраняем новый токен
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7);
		await refreshTokenService.saveRefreshToken(user.id, newRefreshToken, expiresAt);

		return {
			accessToken: newAccessToken,
			refreshToken: newRefreshToken,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
			},
		};
	}

	async logout(refreshToken: string): Promise<void> {
		if (!refreshToken) {
			throw new Error("Refresh token is required");
		}

		// Удаляем конкретный токен
		await refreshTokenService.revokeRefreshToken(refreshToken);
	}

	async logoutAll(userId: string): Promise<void> {
		// Удаляем все токены пользователя
		await refreshTokenService.revokeAllUserTokens(userId);
	}
}

export const authService = new AuthService();
