import { prisma } from "@/lib/prisma";

export class RefreshTokenService {
	async saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void> {
		await prisma.refreshToken.create({
			data: { token, userId, expiresAt },
		});
	}

	async findRefreshToken(token: string) {
		return await prisma.refreshToken.findUnique({
			where: { token },
			include: {
				user: {
					select: { id: true, email: true, name: true },
				},
			},
		});
	}

	async revokeRefreshToken(token: string): Promise<void> {
		await prisma.refreshToken.delete({
			where: { token },
		});
	}

	async revokeAllUserTokens(userId: string): Promise<void> {
		await prisma.refreshToken.deleteMany({
			where: { userId },
		});
	}

	async cleanupExpiredTokens(): Promise<void> {
		await prisma.refreshToken.deleteMany({
			where: {
				expiresAt: { lt: new Date() },
			},
		});
	}

	async isValidToken(token: string): Promise<boolean> {
		const refreshToken = await this.findRefreshToken(token);
		return !!refreshToken && refreshToken.expiresAt > new Date();
	}
}

export const refreshTokenService = new RefreshTokenService();
