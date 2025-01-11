import { RequestLogger } from "./RequestLogger";
import { TimeMiddleware } from "./TimeMiddleware";
import { ErrorHandler } from "./errorHandler";

export const middlewares = [
  new RequestLogger(),
  new TimeMiddleware(),
  new ErrorHandler(),
];
