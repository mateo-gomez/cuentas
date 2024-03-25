import { DatabaseError } from "./databaseError.ts";

export class DuplicateError extends DatabaseError {
  constructor(message: string, cause: Error) {
    super(message, cause);

    this.name = "AlreadyExists";
  }
}
