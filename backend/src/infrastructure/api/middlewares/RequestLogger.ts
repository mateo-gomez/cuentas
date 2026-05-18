import { createLogger } from "../../../lib/logger";
import { Middleware, NextFunction, Request, Response } from "./BaseMiddleware";

const logger = createLogger("RequestLogger");

export class RequestLogger implements Middleware {
	async execute(req: Request, _response: Response, next: NextFunction) {
		logger.info(`${req.method} ${req.path}`, { hostname: req.hostname, time: new Date().toISOString() });
		next();
	}
}
