import { Status } from "../../../deps.ts";
import { ApplicationError } from "../../application/errors/applicationError.ts";
import { NotFoundError } from "../../application/errors/notFoundError.ts";
import { HttpNotFoundError } from "../errors/httpNotFoundError.ts";
import { ValidationError } from "../errors/validationError.ts";
import { HttpResponse } from "../httpResponse.ts";
import {
  Middleware,
  NextFunction,
  Request,
  Response,
} from "./BaseMiddleware.ts";

export class ErrorHandler implements Middleware {
  async execute(_request: Request, _response: Response, next: NextFunction) {
    try {
      await next();
    } catch (err) {
      console.error(err);

      if (err instanceof ApplicationError) {
        const response = HttpResponse.failed(err.message);
        _response.status = response.statusCode;
        return _response.body = response;
      }

      if (err instanceof ValidationError) {
        const response = HttpResponse.validationFailed(err.errors);
        _response.status = response.statusCode;
        return _response.body = response;
      }

      if (err instanceof NotFoundError) {
        const response = HttpResponse.failed(err.message, 404);
        _response.status = response.statusCode;
        return _response.body = response;
      }

      if (err instanceof HttpNotFoundError) {
        const response = HttpResponse.failed(err.message, err.statusCode);
        _response.status = response.statusCode;
        return _response.body = response;
      }

      if (err instanceof Error) {
        const response = HttpResponse.failed(
          "Error interno del servidor",
          Status.InternalServerError,
        );
        _response.status = response.statusCode;
        return _response.body = response;
      }
    }
  }

  static handle = () => {
    return new this().execute;
  };
}
