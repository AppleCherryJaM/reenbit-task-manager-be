import express from "express";
import userController from "../controllers/user/user.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { validateUserId, validateUserTasks, validateUpdateUser } from "../validators/validators";

const userRouter = express.Router();

userRouter.use(authenticateToken);

// Protected routes - all need authentication
userRouter.get("/profile", userController.getProfile);
userRouter.get("/", userController.getAllUsers);
userRouter.get("/:id", validateUserId, userController.getUserById);
userRouter.get("/:id/tasks", validateUserId, validateUserTasks, userController.getUserTasks);

userRouter.put("/:id", validateUserId, validateUpdateUser, userController.updateUser);

userRouter.delete("/:id", userController.deleteUser);

export default userRouter;
