export class DatabaseError extends Error {
  constructor(message: string, cause?: Error) {
    super(message, { cause });

    this.name = "DatabaseError";

    if (cause instanceof Error) {
      Error.captureStackTrace(cause);
    }
  }
}
