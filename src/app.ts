import * as dotenv from "dotenv";

dotenv.config();

if (process.env.NODE_ENV !== "production") {
	require("tsconfig-paths/register");
} else {
	require("./register-aliases");
}

import express, { type Application } from "express";
import cors from 'cors';

import router from "./routes/main-router";

const app: Application = express();
const PORT = process.env.PORT || 5000;
const FE_URL = process.env.CORS_FRONTEND_URL;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: FE_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use("/api", router);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
