import { RequestLogger } from "./RequestLogger.ts";
import { TimeMiddleware } from "./TimeMiddleware.ts";
import { ErrorHandler } from "./errorHandler.ts";

export const middlewares = [
  new RequestLogger(),
  new TimeMiddleware(),
  new ErrorHandler(),
];
