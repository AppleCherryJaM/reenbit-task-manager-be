// services/auth/auth.service.ts
import type { AuthResponse } from "../../utils/auth/auth.types";
import { AuthUtils } from "../../utils/auth/auth.utils";
import { refreshTokenService } from "../refresh-token/refresh-token.service";
import { userService } from "../user/user.service";

interface TokenPayload {
	userId: string;
	email: string;
}

export class AuthService {
	private async generateTokens(user: TokenPayload) {
		const accessToken = AuthUtils.generateAccessToken(user);
		const refreshToken = AuthUtils.generateRefreshToken(user);

		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7);

		await refreshTokenService.saveRefreshToken(user.userId, refreshToken, expiresAt);

		return { accessToken, refreshToken };
	}

	private async validateUserCredentials(email: string, password: string) {
		const user = await userService.findUserByEmail(email);
		if (!user) {
			throw new Error("Invalid email or password");
		}

		const isPasswordValid = await AuthUtils.verifyPassword(password, user.password);
		if (!isPasswordValid) {
			throw new Error("Invalid email or password");
		}

		return user;
	}

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
		const user = await userService.createUser({ email, name, password: hashedPassword });

		const { accessToken, refreshToken } = await this.generateTokens({
			userId: user.id,
			email: user.email,
		});

		return {
			user: { id: user.id, email: user.email, name: user.name },
			accessToken,
			refreshToken,
		};
	}

	async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
		const { email, password } = credentials;

		const user = await this.validateUserCredentials(email, password);
		const { accessToken, refreshToken } = await this.generateTokens({
			userId: user.id,
			email: user.email,
		});

		return {
			user: { id: user.id, email: user.email, name: user.name },
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

		const storedToken = await refreshTokenService.findRefreshToken(refreshToken);
		if (!storedToken) {
			throw new Error("Invalid refresh token");
		}

		if (storedToken.expiresAt < new Date()) {
			await refreshTokenService.revokeRefreshToken(refreshToken);
			throw new Error("Refresh token expired");
		}

		const decoded = AuthUtils.verifyRefreshToken(refreshToken);
		const user = await userService.getUserById(decoded.userId);

		if (!user) {
			throw new Error("User not found");
		}

		// Rotate refresh token
		await refreshTokenService.revokeRefreshToken(refreshToken);
		const tokens = await this.generateTokens({
			userId: user.id,
			email: user.email,
		});

		return {
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
			user: { id: user.id, email: user.email, name: user.name },
		};
	}

	async logout(refreshToken: string): Promise<void> {
		if (!refreshToken) {
			throw new Error("Refresh token is required");
		}
		await refreshTokenService.revokeRefreshToken(refreshToken);
	}

	async logoutAll(userId: string): Promise<void> {
		await refreshTokenService.revokeAllUserTokens(userId);
	}
}

export const authService = new AuthService();
