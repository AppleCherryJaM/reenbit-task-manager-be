import type { NextFunction, Request, Response } from "express";

export type AsyncRequestHandler<T = any> = (
	req: Request<T>,
	res: Response,
	next: NextFunction
) => Promise<void>;
