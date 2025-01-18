import { Middleware, NextFunction, Request, Response } from "./BaseMiddleware";

export class RequestLogger implements Middleware {
	async execute(req: Request, _response: Response, next: NextFunction) {
		const time = new Date(Date.now()).toString();
		console.log(req.method, req.hostname, req.path, time);
		next();
	}
}
