import express from "express";
import userController from "../controllers/user/user.controller";

const authRouter = express.Router();

// Public routes - не требуют аутентификации
authRouter.post("/register", userController.register);
authRouter.post("/login", userController.login);
authRouter.post("/refresh-token", userController.refreshToken);
// authRouter.post("/logout", userController.logout); // если реализуете logout

export default authRouter;