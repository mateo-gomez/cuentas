import {
  Middleware,
  NextFunction,
  Request,
  Response,
} from "./BaseMiddleware.ts";

export class RequestLogger implements Middleware {
  async execute(
    request: Request,
    _response: Response,
    next: NextFunction,
  ) {
    await next();

    console.log(`${request.method} ${request.url}`);
  }
}
