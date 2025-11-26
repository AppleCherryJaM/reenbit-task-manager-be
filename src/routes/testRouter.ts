import { Router } from "express";
import userController from "../controllers/user/user.controller";

const testRouter = Router();

testRouter.get("/test", userController.getAllUsers);

export default testRouter;
