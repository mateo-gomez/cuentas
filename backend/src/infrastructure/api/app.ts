import config from "../../../config/config.ts";
import { ListenOptionsBase } from "../../../deps.ts";
import { RequestLogger } from "./middlewares/RequestLogger.ts";
import { TimeMiddleware } from "./middlewares/TimeMiddleware.ts";
import { ErrorHandler } from "./middlewares/errorHandler.ts";
import { Api } from "./server.ts";
import { getIPAddress } from "./utils/getIPAddress.ts";
import { DBMongo } from "../database/db.ts";
import routes from "./Routes/index.ts";

(async () => {
  const hostname = getIPAddress();
  const listenOptions: ListenOptionsBase = { port: config.PORT, hostname };
  const middlewares = [
    new RequestLogger(),
    new TimeMiddleware(),
    new ErrorHandler(),
  ];

  const db = new DBMongo(Deno.env.get("MONGO_URI") || "");
  const app = new Api({ listenOptions, middlewares, routes });

  await db.connect();
  await app.run();
})();
