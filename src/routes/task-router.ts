import express from "express";
import taskController from "../controllers/task/task.controller";
import { validateTaskId, validateUpdateTask } from "../validators/task.validator";

const taskRouter = express.Router();

taskRouter.post("/new", taskController.createTask);

taskRouter.get("/", taskController.getTasks);
taskRouter.get("/:id", validateTaskId, taskController.getTaskById);

taskRouter.delete("/:id", validateTaskId, taskController.deleteTask);

taskRouter.put("/:id", validateTaskId, validateUpdateTask, taskController.updateTask);

export default taskRouter;
