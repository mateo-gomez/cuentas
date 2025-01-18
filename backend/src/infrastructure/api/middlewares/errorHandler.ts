import { ApplicationError } from "../../../application/errors/applicationError";
import { NotFoundError } from "../../../application/errors/notFoundError";
import { HttpNotFoundError } from "../errors/httpNotFoundError";
import { ValidationError } from "../errors/validationError";
import { HttpResponse } from "../httpResponse";
import { Status } from "../status";
import { Middleware, NextFunction, Request, Response } from "./BaseMiddleware";

export class ErrorHandler {
	async execute(
		_error: Error,
		_request: Request,
		_response: Response,
		next: NextFunction
	) {
		try {
			next();
		} catch (err) {
			console.error(err);

			if (err instanceof ApplicationError) {
				const response = HttpResponse.failed(err.message);
				return _response.status(response.statusCode).json(response);
			}

			if (err instanceof ValidationError) {
				const response = HttpResponse.validationFailed(err.errors);
				return _response.status(response.statusCode).json(response);
			}

			if (err instanceof NotFoundError) {
				const response = HttpResponse.failed(err.message, 404);
				return _response.status(response.statusCode).json(response);
			}

			if (err instanceof HttpNotFoundError) {
				const response = HttpResponse.failed(err.message, err.statusCode);
				return _response.status(response.statusCode).json(response);
			}

			if (err instanceof Error) {
				const response = HttpResponse.failed(
					"Error interno del servidor",
					Status.InternalServerError
				);
				return _response.status(response.statusCode).json(response);
			}
		}
	}

	static handle = () => {
		return new this().execute;
	};
}
