export type FieldError = string;
export type ValidationErrors = Record<string, FieldError[]>;

export class ValidationError extends Error {
  private _status: number = 400;
  private _errors: ValidationErrors;

  constructor(
    errors?: ValidationErrors,
  ) {
    super("Invalid data provided");

    this._errors = errors || {};
    this.message = `Los datos ingresados no son válidos.`;
  }

  public get errors(): ValidationErrors {
    return this._errors;
  }

  public addError(field: string, message: string) {
    if (!(field in this.errors)) {
      this.errors[field] = [];
    }

    this.errors[field].push(message);

    return this;
  }

  public get status(): number {
    return this._status;
  }
}
