import { ApplicationError } from "../../../application/errors/applicationError";
import { NotFoundError } from "../../../application/errors/notFoundError";
import { HttpNotFoundError } from "../errors/httpNotFoundError";
import { ValidationError } from "../errors/validationError";
import { HttpResponse } from "../httpResponse";
import { Status } from "../status";
import {
  Middleware,
  NextFunction,
  Request,
  Response,
} from "./BaseMiddleware";

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
