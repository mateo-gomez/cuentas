import { middlewareCompose } from "./middlewares/middlewareCompose";
import { Middleware } from "./middlewares/BaseMiddleware";
import { App } from "../interfaces/app";
import express, { NextFunction, Request, Response, Router } from "express";
import helmet from "helmet";
import cors from "cors";
import { ErrorHandler } from "./middlewares/errorHandler";

interface Options {
	middlewares: Middleware[];
	routes: Router[];
	listenOptions: {
		port: number;
		hostname?: string;
	};
}

export class Api implements App {
	private readonly app: express.Application;
	private readonly listenOptions: Options["listenOptions"];

	constructor(private readonly options: Options) {
		this.app = express();
		this.listenOptions = options.listenOptions;
		this.configMiddlewares(options.middlewares);
		this.configRoutes(options.routes);
		this.configErrorHandler();
	}

	configMiddlewares(middlewares: Middleware[]) {
		middlewareCompose(this.app, middlewares);
		this.app.use(express.json());
		this.app.use(cors());
		this.app.use(helmet());
	}

	configErrorHandler() {
		this.app.use(ErrorHandler.handle());
	}

	configRoutes(routes: Router[]) {
		routes.forEach((route) => {
			this.app.use(route);
		});
	}

	async run(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.app
				.listen(this.listenOptions.port, () => {
					console.log(
						`Server listening on http://localhost:${this.listenOptions.port}...`
					);
				})
				.on("error", (err) => {
					console.error(err);
					reject(err);
				});
		});
	}
}
