import "https://deno.land/std@0.173.0/dotenv/load.ts";

import config from "./config/config.ts";
import {
  Application,
  isHttpError,
  ListenOptionsBase,
  Status,
} from "https://deno.land/x/oak@v11.1.0/mod.ts";

import "./src/infrastructure/database/db.ts";

import categoriesRouter from "./src/infrastructure/Routes/categories.routes.ts";
import transactionsRouter from "./src/infrastructure/Routes/transactions.routes.ts";

const app = new Application();

// Log
app.use(async (ctx, next) => {
  await next();

  console.log(`${ctx.request.method} ${ctx.request.url}`);
});

// Timing
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

app.use(categoriesRouter.routes());
app.use(categoriesRouter.allowedMethods());
app.use(transactionsRouter.routes());
app.use(transactionsRouter.allowedMethods());

app.addEventListener("error", (evt) => {
  // Will log the thrown error to the console.
  console.log(evt.error);
});

app.addEventListener("listen", ({ hostname, port, secure }) => {
  // Will log the thrown error to the console.
  console.log(
    `Server listening on ${secure ? "https" : "http"}://${
      hostname ?? "localhost"
    }:${port}...`,
  );
});

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (isHttpError(err)) {
      switch (err.status) {
        case Status.InternalServerError:
          ctx.response.status = err.status;
          ctx.response.body = { message: err.message };
          break;
        default:
          // handle other statuses
      }
    } else {
      // rethrow if you can't handle the error
      throw err;
    }
  }
});

const PORT = config.PORT;

const options: ListenOptionsBase = { port: PORT };

await app.listen(options);
