import { ValidationErrors } from "./errors/validationError.ts";
import { Status } from "./status.ts";

export interface Response {
  statusCode: Status;
}

export interface SuccessResponseBody<T> extends Response {
  data?: T;
}

class HttpResponseSuccess<T> implements SuccessResponseBody<T> {
  constructor(
    public readonly statusCode: number,
    public readonly data?: T,
  ) {
  }
}

export interface ErrorResponseBody extends Response {
  message: string;
  errors?: ValidationErrors;
}

class HttpResponseFailed implements ErrorResponseBody {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly errors?: ValidationErrors,
  ) {
  }
}

export class HttpResponse {
  static success<T = Record<string, unknown>>(data?: T, statusCode = 200) {
    return new HttpResponseSuccess(statusCode, data);
  }

  static validationFailed(errors: ValidationErrors, statusCode = 400) {
    return new HttpResponseFailed(
      statusCode,
      "Los datos ingresado no son válidos",
      errors,
    );
  }

  static failed(message: string, statusCode = 400) {
    return new HttpResponseFailed(statusCode, message);
  }
}
