import "https://deno.land/std@0.173.0/dotenv/load.ts";

import config from "./config/config.ts";
import {
  Application,
  ListenOptionsBase,
} from "https://deno.land/x/oak@v11.1.0/mod.ts";

import "./src/infrastructure/database/db.ts";

import categoriesRouter from "./src/infrastructure/Routes/categories.routes.ts";
import transactionsRouter from "./src/infrastructure/Routes/transactions.routes.ts";
import { ErrorHandler } from "./src/infrastructure/middlewares/errorHandler.ts";
import { middlewareCompose } from "./src/infrastructure/middlewares/middlewareCompose.ts";
import { TimeMiddleware } from "./src/infrastructure/middlewares/TimeMiddleware.ts";
import { RequestLogger } from "./src/infrastructure/middlewares/RequestLogger.ts";

const app = new Application();

app.addEventListener("error", (evt) => {
  // Will log the thrown error to the console.
  console.error(evt.error);
});

app.use(middlewareCompose([
  new RequestLogger(),
  new TimeMiddleware(),
  new ErrorHandler(),
]));

app.use(categoriesRouter.routes());
app.use(categoriesRouter.allowedMethods());
app.use(transactionsRouter.routes());
app.use(transactionsRouter.allowedMethods());

app.addEventListener("listen", ({ hostname, port, secure }) => {
  // Will log the thrown error to the console.
  console.log(
    `Server listening on ${secure ? "https" : "http"}://${
      hostname ?? "localhost"
    }:${port}...`,
  );
});

const PORT = config.PORT;

const options: ListenOptionsBase = { port: PORT };

await app.listen(options);
