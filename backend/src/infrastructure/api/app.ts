import config from "../../../config/config.ts";
import { ListenOptionsBase, Router } from "../../../deps.ts";
import { RequestLogger } from "./middlewares/RequestLogger.ts";
import { TimeMiddleware } from "./middlewares/TimeMiddleware.ts";
import { ErrorHandler } from "./middlewares/errorHandler.ts";
import { Api } from "./server.ts";
import { getIPAddress } from "./utils/getIPAddress.ts";
import categoriesRouter from "./Routes/categories.routes.ts";
import transactionsRouter from "./Routes/transactions.routes.ts";
import { DBMongo } from "../database/db.ts";

(async () => {
  const hostname = getIPAddress();
  const listenOptions: ListenOptionsBase = { port: config.PORT, hostname };
  const middlewares = [
    new RequestLogger(),
    new TimeMiddleware(),
    new ErrorHandler(),
  ];
  const mainRouter = new Router();

  mainRouter.use(categoriesRouter.routes());
  mainRouter.use(categoriesRouter.allowedMethods());
  mainRouter.use(transactionsRouter.routes());
  mainRouter.use(transactionsRouter.allowedMethods());

  const db = new DBMongo(Deno.env.get("MONGO_URI") || "");
  const app = new Api({ listenOptions, middlewares, routers: mainRouter });

  await db.connect();
  await app.run();
})();
