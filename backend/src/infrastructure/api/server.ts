import { middlewareCompose } from "./middlewares/middlewareCompose.ts";
import { Middleware } from "./middlewares/BaseMiddleware.ts";
import { Application, ListenOptionsBase, Router } from "../../../deps.ts";
import { App } from "../interfaces/app.ts";

interface Options {
  middlewares: Middleware[];
  routers: Router;
  listenOptions: ListenOptionsBase;
}

export class Api implements App {
  private readonly app: Application;
  private readonly listenOptions: ListenOptionsBase;

  constructor(private readonly options: Options) {
    this.app = new Application();
    this.listenOptions = options.listenOptions;
    this.configMiddlewares(options.middlewares);
    this.configRoutes(options.routers);
    this.configListen();
    this.configErrorListener();
  }

  configErrorListener() {
    this.app.addEventListener("error", (evt) => {
      // Will log the thrown error to the console.
      console.error(evt.error);
    });
  }

  configListen() {
    this.app.addEventListener("listen", ({ hostname, port, secure }) => {
      console.log(
        `Server listening on ${secure ? "https" : "http"}://${
          hostname ?? "localhost"
        }:${port}...`,
      );
    });
  }

  configMiddlewares(middlewares: Middleware[]) {
    this.app.use(middlewareCompose(middlewares));
  }

  configRoutes(routers: Router) {
    this.app.use(routers.routes());
    this.app.use(routers.allowedMethods());
  }

  async run(): Promise<void> {
    await this.app.listen(this.listenOptions);
  }
}
