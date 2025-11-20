import express from "express";
import taskController from "../controllers/task/task.controller";

const taskRouter = express.Router();

taskRouter.post("/new", taskController.createTask);

taskRouter.get("/", taskController.getTasks);
taskRouter.get("/:id", taskController.getTaskById);

taskRouter.delete("/:id", taskController.deleteTask);

taskRouter.patch("/:id", taskController.updateTask);

export default taskRouter;