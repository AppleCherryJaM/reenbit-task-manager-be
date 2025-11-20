import express from "express";

import taskRouter from "./task-router";
import userRouter from "./user-router";

const router = express.Router();

router.use("/users", userRouter);
router.use("/tasks", taskRouter);

export default router;