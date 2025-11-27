import express from "express";

import userController from "@/controllers/user/user.controller";
import { authenticateToken } from "@/middlewares/auth.middleware";
import { validateLogout, validateRefreshToken } from "@/validators/auth.validator";
import { validateLogin, validateRegister } from "@/validators/user.validator";

const authRouter = express.Router();

authRouter.post("/register", validateRegister, userController.register);
authRouter.post("/login", validateLogin, userController.login);
authRouter.post("/refresh-token", validateRefreshToken, userController.refreshToken);
authRouter.post("/logout", validateLogout, userController.logout);

authRouter.post("/logout-all", authenticateToken, userController.logoutAll);

export default authRouter;
