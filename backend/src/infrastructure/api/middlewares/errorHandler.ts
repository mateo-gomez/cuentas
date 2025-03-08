import { ApplicationError } from "../../../application/errors/applicationError";
import { ForbiddenError } from "../../../application/errors/forbiddenError";
import { NotFoundError } from "../../../application/errors/notFoundError";
import { HttpNotFoundError } from "../errors/httpNotFoundError";
import { ValidationError } from "../errors/validationError";
import { HttpResponse } from "../httpResponse";
import { Status } from "../status";
import { Middleware, NextFunction, Request, Response } from "./BaseMiddleware";

export class ErrorHandler {
	async execute(
		error: Error,
		_request: Request,
		response: Response,
		next: NextFunction
	) {
		console.error(error);

		if (response.headersSent) {
			next(error);
			return;
		}

		if (error instanceof ApplicationError) {
			const res = HttpResponse.failed(error.message);
			response.status(res.statusCode).json(res);
			return;
		}

		if (error instanceof ValidationError) {
			const res = HttpResponse.validationFailed(error.errors);
			response.status(res.statusCode).json(res);
			return;
		}

		if (error instanceof NotFoundError) {
			const res = HttpResponse.failed(error.message, 404);
			response.status(res.statusCode).json(res);
			return;
		}

		if (error instanceof ForbiddenError) {
			const res = HttpResponse.failed(error.message, 403);
			response.status(res.statusCode).json(res);
			return;
		}

		if (error instanceof HttpNotFoundError) {
			const res = HttpResponse.failed(error.message, error.statusCode);
			response.status(res.statusCode).json(res);
			return;
		}

		if (error instanceof Error) {
			const res = HttpResponse.failed(
				"Error interno del servidor",
				Status.InternalServerError
			);
			response.status(res.statusCode).json(res);
			return;
		}
	}

	static handle = () => {
		return new this().execute;
	};
}
