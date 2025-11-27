import { validateBody } from "../middlewares/validation.middleware";
import { logoutSchema, refreshTokenSchema } from "../models/validation/validation.schema";

export const validateRefreshToken = validateBody(refreshTokenSchema);
export const validateLogout = validateBody(logoutSchema);
