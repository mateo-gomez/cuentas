import { NextFunction, Request, Response } from "express";
import { Middleware } from "./BaseMiddleware";
import { Api } from "../server";

export function middlewareCompose(
	app: Api["app"],
	middlewareChain: Middleware[]
) {
	middlewareChain.forEach((middleware) => {
		app.use((req: Request, res: Response, next: NextFunction) => {
			middleware.execute(req, res, next);
		});
	});
}
