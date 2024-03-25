export interface Request {
  // deno-lint-ignore no-explicit-any
  body: Record<string, any>;
  method: "GET" | "OPTIONS" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD";
  url: URL;
}

export interface Response {
  status: number;
  // deno-lint-ignore no-explicit-any
  body: any;
  headers: Headers;
}

export interface Context {
  response: Response;
  request: Request;
}

export type NextFunction = () => Promise<unknown>;

export interface Middleware {
  execute: (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => unknown;
}
