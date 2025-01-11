import { middlewareCompose } from "./middlewares/middlewareCompose";
import { Middleware } from "./middlewares/BaseMiddleware";
import { App } from "../interfaces/app";
import  express, { Router } from "express";
import bodyParser from "body-parser";

interface Options {
  middlewares: Middleware[];
  routes: Router[];
  listenOptions: {
	port:number,
	hostname:string
  };
}

export class Api implements App {
  private readonly app;
  private readonly listenOptions;

  constructor(private readonly options: Options) {
    this.app = express();
    this.listenOptions = options.listenOptions;
    this.configMiddlewares(options.middlewares);
    this.configRoutes(options.routes);
    this.configListen();
  }

  configListen() {
    this.app.listen (this.listenOptions.port, () => {
      console.log(
        `Server listening on http://${
			this.listenOptions.hostname ?? "localhost"
        }:${this.listenOptions.port}...`,
      );
    });
  }

  configMiddlewares(middlewares: Middleware[]) {
    this.app.use(middlewareCompose(middlewares));
	this.app.use(bodyParser.json());
	this.app.use(bodyParser.urlencoded({ extended: true }))
  }

  configRoutes(routes: Router[]) {
    routes.forEach((route) => {
      this.app.use(route);
    });
  }

  async run(): Promise<void> {
    await this.app.listen(this.listenOptions);
  }
}
