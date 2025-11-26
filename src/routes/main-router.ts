import express from "express";

import authRouter from "./auth-router";
import taskRouter from "./task-router";
import testRouter from "./testRouter";
import userRouter from "./user-router";

const router = express.Router();

router.use("/users", userRouter);
router.use("/auth", authRouter);
router.use("/tasks", taskRouter);
router.use("/test", testRouter);

export default router;
