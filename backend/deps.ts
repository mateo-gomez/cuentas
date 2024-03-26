import mongoose from "npm:mongoose@6.8";

export { resolveMongoDNS } from "https://deno.land/x/resolve_mongo_dns@v1.0.0/mod.ts";

export {
  Application,
  composeMiddleware,
  Context,
  isHttpError,
  Router,
  Status,
} from "https://deno.land/x/oak@v11.1.0/mod.ts";

export type {
  ListenOptionsBase,
  Request,
  Response,
  RouterContext,
} from "https://deno.land/x/oak@v11.1.0/mod.ts";

export { model, Schema, Types } from "npm:mongoose@6.8";

export type {
  Error as MongooseError,
  HydratedDocument,
  ValidateFn,
  ValidatorProps,
} from "npm:mongoose@6.8";

export { mongoose };
