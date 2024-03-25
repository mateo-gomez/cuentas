import {
  Middleware,
  NextFunction,
  Request,
  Response,
} from "./BaseMiddleware.ts";

export class TimeMiddleware implements Middleware {
  async execute(
    _request: Request,
    response: Response,
    next: NextFunction,
  ) {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    response.headers.set("X-Response-Time", `${ms}ms`);
  }
}
