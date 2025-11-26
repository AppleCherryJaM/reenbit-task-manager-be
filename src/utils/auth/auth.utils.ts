// utils/auth/auth.utils.ts
import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "./auth.types";

export class AuthUtils {
	private static readonly SALT_ROUNDS = 12;
	private static readonly ACCESS_TOKEN_EXPIRES_IN = "1h";
	private static readonly REFRESH_TOKEN_EXPIRES_IN = "7d";

	private static getSecret(secretName: "JWT_SECRET" | "REFRESH_TOKEN_SECRET"): string {
		const secret = process.env[secretName];
		if (!secret) {
			throw new Error(`${secretName} is not configured in environment variables`);
		}
		return secret;
	}

	static async hashPassword(password: string): Promise<string> {
		return await bcrypt.hash(password, AuthUtils.SALT_ROUNDS);
	}

	static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
		return await bcrypt.compare(password, hashedPassword);
	}

	static generateAccessToken(payload: { userId: string; email: string }): string {
		return jwt.sign(payload, this.getSecret("JWT_SECRET"), {
			expiresIn: AuthUtils.ACCESS_TOKEN_EXPIRES_IN,
		});
	}

	static generateRefreshToken(payload: { userId: string; email: string }): string {
		return jwt.sign(payload, AuthUtils.getSecret("REFRESH_TOKEN_SECRET"), {
			expiresIn: AuthUtils.REFRESH_TOKEN_EXPIRES_IN,
		});
	}

	static verifyAccessToken(token: string): JwtPayload {
		return jwt.verify(token, AuthUtils.getSecret("JWT_SECRET")) as JwtPayload;
	}

	static verifyRefreshToken(token: string): JwtPayload {
		return jwt.verify(token, AuthUtils.getSecret("REFRESH_TOKEN_SECRET")) as JwtPayload;
	}
}
