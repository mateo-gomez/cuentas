export class HttpNotFoundError extends Error {
  public readonly statusCode = 404;

  constructor(public readonly modelName: string, public readonly id: string) {
    super(`Resource "${id}" not found`);

    this.message = `Recurso no encontrado`;
  }
}
