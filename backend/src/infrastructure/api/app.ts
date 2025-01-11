import config from "../../../config/config";
import { middlewares } from "./middlewares/index";
import { Api } from "./server";
import { getIPAddress } from "./utils/getIPAddress";
import { DBMongo } from "../database/db";
import { routes } from "./Routes/index";

(async () => {
  const hostname = getIPAddress();
  const listenOptions = { port: config.PORT, hostname };

  const db = new DBMongo(config.MONGO_URI || "");
  const app = new Api({ listenOptions, middlewares, routes });

  await db.connect();
  await app.run();
})();
