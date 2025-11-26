import express from "express";
import userController from "../controllers/user/user.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const userRouter = express.Router();

userRouter.use(authenticateToken);

// Protected routes - all need authentication
userRouter.get("/profile", userController.getProfile);
userRouter.get("/", userController.getAllUsers);
userRouter.get("/:id", userController.getUserById);
userRouter.get("/:id/tasks", userController.getUserTasks);

userRouter.put("/:id", userController.updateUser);

userRouter.delete("/:id", userController.deleteUser);

export default userRouter;
