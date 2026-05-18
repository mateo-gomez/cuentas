export class ApiError extends Error {
  readonly statusCode: number
  readonly errors?: Record<string, string[]>

  constructor(message: string, statusCode: number, errors?: Record<string, string[]>) {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
    this.errors = errors
  }
}

export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError
