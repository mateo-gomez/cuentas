import { middlewareCompose } from "./middlewares/middlewareCompose.ts";
import { Middleware } from "./middlewares/BaseMiddleware.ts";
import { Application, ListenOptionsBase, Router } from "../../../deps.ts";
import { App } from "../interfaces/app.ts";

interface Options {
  middlewares: Middleware[];
  routes: Router[];
  listenOptions: ListenOptionsBase;
}

export class Api implements App {
  private readonly app: Application;
  private readonly listenOptions: ListenOptionsBase;

  constructor(private readonly options: Options) {
    this.app = new Application();
    this.listenOptions = options.listenOptions;
    this.configMiddlewares(options.middlewares);
    this.configRoutes(options.routes);
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

  configRoutes(routes: Router[]) {
    routes.forEach((route) => {
      this.app.use(route.routes());
      this.app.use(route.allowedMethods());
    });
  }

  async run(): Promise<void> {
    await this.app.listen(this.listenOptions);
  }
}
