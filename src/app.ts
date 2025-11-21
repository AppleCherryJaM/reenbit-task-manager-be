import * as dotenv from "dotenv";
import express, { type Application } from "express";

import router from "./routes/main-router";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
