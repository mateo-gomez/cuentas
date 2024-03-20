export class ApplicationError extends Error {
  constructor(
    message: string,
    cause?: ErrorOptions,
  ) {
    super(message, { cause: cause });

    Object.setPrototypeOf(this, new.target.prototype);

    if (cause instanceof Error) {
      Error.captureStackTrace(cause);
    }
  }
}
