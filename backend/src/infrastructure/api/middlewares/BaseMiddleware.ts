import {
	Request as ExpressRequest,
	Response as ExpressResponse,
	NextFunction as ExpressNextFunction,
} from "express";

export type Request = ExpressRequest;

export type Response = ExpressResponse;

export type NextFunction = ExpressNextFunction;
export interface Middleware {
	execute: (
		request: Request,
		response: Response,
		next: NextFunction
	) => unknown;
}
