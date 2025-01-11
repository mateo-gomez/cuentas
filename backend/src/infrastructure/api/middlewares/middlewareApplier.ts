import { Middleware } from "./BaseMiddleware";

export function middlewareApplier<T extends Middleware, P>(
  MiddlewareClass: { new (options?: P): T },
  options?: P,
) {
  const implementation = options
    ? new MiddlewareClass()
    : new MiddlewareClass(options);

  return implementation.execute;
}
