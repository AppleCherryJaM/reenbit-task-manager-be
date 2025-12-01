import { z } from "zod";

export const userTasksQuerySchema = z.object({
	type: z.enum(["authored", "assigned"]).optional(),
});
