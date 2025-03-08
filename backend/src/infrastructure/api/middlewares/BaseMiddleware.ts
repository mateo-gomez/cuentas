import {
	Request as ExpressRequest,
	Response as ExpressResponse,
	NextFunction as ExpressNextFunction,
} from "express";
import { UserLogged } from "../../types/UserLogged";

export type Request = ExpressRequest;

export interface RequestAuthenticated extends Request {
	user?: UserLogged;
}

export type Response = ExpressResponse;

export type NextFunction = ExpressNextFunction;
export interface Middleware {
	execute: (request: Request, response: Response, next: NextFunction) => void;
}
