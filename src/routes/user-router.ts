import express from "express";

import userController from "@/controllers/user/user.controller";
import { authenticateToken } from "@/middlewares/auth.middleware";
import { validateUpdateUser, validateUserId, validateUserTasks } from "@/validators/user.validator";

const userRouter = express.Router();

userRouter.get("/", userController.getAllUsers);
userRouter.get("/profile", authenticateToken, userController.getProfile);
userRouter.get("/:id", authenticateToken, validateUserId, userController.getUserById);
userRouter.get(
	"/:id/tasks",
	authenticateToken,
	validateUserId,
	validateUserTasks,
	userController.getUserTasks
);

userRouter.put(
	"/:id",
	authenticateToken,
	validateUserId,
	validateUpdateUser,
	userController.updateUser
);

userRouter.delete("/:id", authenticateToken, userController.deleteUser);

export default userRouter;
