import express from "express";
import userController from "../controllers/user/user.controller";

const userRouter = express.Router();

userRouter.post("/new", userController.createUser);

userRouter.get("/", userController.getAllUsers);
userRouter.get("/:id", userController.getUserById);
userRouter.get("/:id/tasks", userController.getUserTasks);

userRouter.delete("/:id", userController.deleteUser);

userRouter.put("/:id", userController.updateUser);

export default userRouter;
