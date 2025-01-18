import { RequestLogger } from "./RequestLogger";
import { ErrorHandler } from "./errorHandler";

export const middlewares = [new RequestLogger()];
