export class NotFoundError extends Error {
  constructor(
    message: string,
    public readonly id: string,
  ) {
    super(message);
  }
}
