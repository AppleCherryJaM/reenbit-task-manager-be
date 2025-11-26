import type { NextFunction, Response } from "express";
import type { AuthRequest, JwtPayload } from "../controllers/user/auth/auth.types";
import { AuthUtils } from "../controllers/user/auth/auth.utils";

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

	if (!token) {
		res.status(401).json({ error: "Access token required" });
		return;
	}

	try {
		const decoded: JwtPayload = AuthUtils.verifyAccessToken(token);
		req.user = {
			userId: decoded.userId,
			email: decoded.email
		};
		next();
	} catch (error) {
		res.status(403).json({ error: "Invalid or expired token" });
	}
};