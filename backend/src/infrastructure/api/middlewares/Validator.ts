import {
  Middleware,
  NextFunction,
  Request,
  Response,
} from "./BaseMiddleware.ts";

export class Validator implements Middleware {
  execute(
    _request: Request,
    _response: Response,
    next: NextFunction,
  ) {
    console.log("VALIDANDO!!!!!!");
  }
}
