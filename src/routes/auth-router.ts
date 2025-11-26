import express from "express";
import userController from "../controllers/user/user.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import {
	validateLogin,
	validateLogout,
	validateRefreshToken,
	validateRegister,
} from "../validators/validators";

const authRouter = express.Router();

// Public routes
authRouter.post("/register", validateRegister, userController.register);
authRouter.post("/login", validateLogin, userController.login);
authRouter.post("/refresh-token", validateRefreshToken, userController.refreshToken);
authRouter.post("/logout", validateLogout, userController.logout);

// Protected routes
authRouter.post("/logout-all", authenticateToken, userController.logoutAll);

export default authRouter;
