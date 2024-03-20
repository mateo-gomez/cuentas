import { ValidationErrors } from "./errors/validationError.ts";
import { Status } from "./status.ts";

export interface SuccessResponseBody<T> {
  data: T;
  statusCode: Status;
}

export interface ErrorResponseBody {
  message: string;
  errors: ValidationErrors;
  statusCode: Status;
}

class HttpResponseSuccess<T = Record<string, unknown>> {
  constructor(
    public readonly data: T | undefined,
    public readonly statusCode: number,
  ) {
  }
}

class HttpResponseFailed<T = Record<string, unknown>> {
  constructor(
    public readonly message: string,
    public readonly errors: T,
    public readonly statusCode: number,
  ) {
  }
}

export class HttpResponse {
  static success<T = Record<string, unknown>>(data?: T, statusCode = 200) {
    return new HttpResponseSuccess<T>(data, statusCode);
  }

  static validationFailed(error: ValidationErrors | string, statusCode = 400) {
    return new HttpResponseFailed(
      "Los datos ingresado no son válidos",
      error,
      statusCode,
    );
  }

  static failed(message: string, statusCode = 400) {
    return new HttpResponseFailed(message, null, statusCode);
  }
}
