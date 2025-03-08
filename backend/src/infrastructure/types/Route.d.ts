import { Router } from "express";
import {
	Middleware,
	NextFunction,
	Request,
	Response,
} from "../api/middlewares/BaseMiddleware";

export interface Route {
	path: string;
	middleware?: (
		request: Request,
		response: Response,
		next: NextFunction
	) => void;
	router: Router;
}
