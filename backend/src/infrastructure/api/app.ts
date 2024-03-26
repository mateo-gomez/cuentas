import config from "../../../config/config.ts";
import { ListenOptionsBase } from "../../../deps.ts";
import { middlewares } from "./middlewares/middlewares.ts";
import { Api } from "./server.ts";
import { getIPAddress } from "./utils/getIPAddress.ts";
import { DBMongo } from "../database/db.ts";
import routes from "./Routes/index.ts";

(async () => {
  const hostname = getIPAddress();
  const listenOptions: ListenOptionsBase = { port: config.PORT, hostname };

  const db = new DBMongo(Deno.env.get("MONGO_URI") || "");
  const app = new Api({ listenOptions, middlewares, routes });

  await db.connect();
  await app.run();
})();
