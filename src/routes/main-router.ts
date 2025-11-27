import express from "express";

import authRouter from "./auth-router";
import taskRouter from "./task-router";
import userRouter from "./user-router";

const router = express.Router();

router.use("/users", userRouter);
router.use("/auth", authRouter);
router.use("/tasks", taskRouter);

export default router;
