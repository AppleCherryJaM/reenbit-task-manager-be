import path from "path";
import { defineConfig } from "prisma/config";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL is not set in environment variables.");
}

export default defineConfig({
	schema: path.join(__dirname, "../prisma/schema.prisma"),
	migrations: {
		path: path.join(__dirname, "../prisma/migrations"),
	},
	datasource: {
		url: dbUrl,
	},
});
