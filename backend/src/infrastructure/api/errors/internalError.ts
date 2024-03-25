export class InternalError extends Error {
  private _canHandle: boolean;
  private _status = 500;

  constructor(
    message: string,
    originalError?: Error,
    canHandle?: boolean,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.message = message;
    this._canHandle = canHandle || true;
    this.stack = originalError?.stack || this.stack;
  }

  public get canHandle(): boolean {
    return this._canHandle;
  }

  public get status(): number {
    return this._status;
  }
}
