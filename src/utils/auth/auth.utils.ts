import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "./auth.types";

export class AuthUtils {
	private static readonly SALT_ROUNDS = 12;

	private static getJwtSecret(): string {
		const secret = process.env.JWT_SECRET;
		if (!secret) {
			throw new Error("JWT_SECRET is not configured in .env file");
		}
		return secret;
	}

	private static getRefreshTokenSecret(): string {
		const secret = process.env.REFRESH_TOKEN_SECRET;
		if (!secret) {
			throw new Error("REFRESH_TOKEN_SECRET is not configured in .env file");
		}
		return secret;
	}

	static async hashPassword(password: string): Promise<string> {
		return await bcrypt.hash(password, this.SALT_ROUNDS);
	}

	static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
		return await bcrypt.compare(password, hashedPassword);
	}

	static generateAccessToken(payload: { userId: string; email: string }): string {
		return jwt.sign(payload, this.getJwtSecret(), {
			expiresIn: "1h",
		} as jwt.SignOptions);
	}

	static generateRefreshToken(payload: { userId: string; email: string }): string {
		return jwt.sign(payload, this.getRefreshTokenSecret(), {
			expiresIn: "7d",
		} as jwt.SignOptions);
	}

	static verifyAccessToken(token: string): JwtPayload {
		return jwt.verify(token, this.getJwtSecret()) as JwtPayload;
	}

	static verifyRefreshToken(token: string): JwtPayload {
		return jwt.verify(token, this.getRefreshTokenSecret()) as JwtPayload;
	}
}
