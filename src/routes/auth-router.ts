import express from "express";
import userController from "../controllers/user/user.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const authRouter = express.Router();

// Public routes - не требуют аутентификации
authRouter.post("/register", userController.register);
authRouter.post("/login", userController.login);
authRouter.post("/refresh-token", userController.refreshToken);
authRouter.post("/logout", userController.logout);

// Protected routes
authRouter.post("/logout-all", authenticateToken, userController.logoutAll);

export default authRouter;
