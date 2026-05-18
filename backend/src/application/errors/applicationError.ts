export class ApplicationError extends Error {
  constructor(
    message: string,
    cause?: unknown,
  ) {
    super(message, { cause });

    Object.setPrototypeOf(this, new.target.prototype);

    if (cause instanceof Error) {
      Error.captureStackTrace(cause);
    }
  }
}
