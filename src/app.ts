import * as dotenv from "dotenv";

dotenv.config();

if (process.env.NODE_ENV !== "production") {
	require("tsconfig-paths/register");
} else {
	require("./register-aliases");
}

import cors from "cors";
import express, { type Application } from "express";

import router from "./routes/main-router";

const app: Application = express();
const PORT = process.env.PORT;
const allowedOrigins = (process.env.CORS_FRONTEND_URL || "")
  .split(",")
  .map(url => url.trim())
  .filter(url => url.length > 0);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
	cors({
		origin: (origin, callback) => {

      if (!origin) return callback(null, true);
      
			if (allowedOrigins.includes(origin)) {
        return callback(null, origin);
      }
			
      return callback(new Error("Not allowed by CORS"));
    },
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
	})
);

app.use("/api", router);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
