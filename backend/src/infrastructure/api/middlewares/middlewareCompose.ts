import { composeMiddleware, Context } from "../../../../deps";
import { Middleware } from "./BaseMiddleware";

export function middlewareCompose(middlewareChain: Middleware[]) {
  const chain = middlewareChain.map(
    (middleware) => (ctx: Context, next: () => Promise<unknown>) =>
      middleware.execute(ctx.request, ctx.response, next),
  );

  return composeMiddleware(chain);
}
