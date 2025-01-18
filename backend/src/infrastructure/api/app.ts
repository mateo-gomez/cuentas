import config from "../../../config/config";
import { middlewares } from "./middlewares/index";
import { Api } from "./server";
import { DBMongo } from "../database/db";
import { routes } from "./Routes/index";

(async () => {
	const listenOptions = { port: config.PORT };

	const db = new DBMongo(config.MONGO_URI || "");
	const app = new Api({ listenOptions, middlewares, routes });

	await db.connect();
	await app.run();
})();
