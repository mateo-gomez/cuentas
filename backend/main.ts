import "https://deno.land/std@0.173.0/dotenv/load.ts";

import config from "./config/config.ts";
import {
  Application,
  ListenOptionsBase,
} from "https://deno.land/x/oak@v11.1.0/mod.ts";

import "./src/infrastructure/database/db.ts";

import categoriesRouter from "./src/infrastructure/Routes/categories.routes.ts";
import transactionsRouter from "./src/infrastructure/Routes/transactions.routes.ts";
import { ApplicationError } from "./src/application/errors/applicationError.ts";
import { ValidationError } from "./src/infrastructure/errors/validationError.ts";
import { Status } from "./src/infrastructure/status.ts";
import { HttpResponse } from "./src/infrastructure/httpResponse.ts";
import { NotFoundError } from "./src/application/errors/notFoundError.ts";
import { HttpNotFoundError } from "./src/infrastructure/errors/httpNotFoundError.ts";

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

app.addEventListener("error", (evt) => {
  // Will log the thrown error to the console.
  console.error(evt.error);
});

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err);

    if (err instanceof ApplicationError) {
      const response = HttpResponse.failed(err.message);
      ctx.response.status = response.statusCode;
      return ctx.response.body = response;
    }

    if (err instanceof ValidationError) {
      const response = HttpResponse.validationFailed(err.errors);
      ctx.response.status = response.statusCode;
      return ctx.response.body = response;
    }

    if (err instanceof NotFoundError) {
      const response = HttpResponse.failed(err.message, 404);
      ctx.response.status = response.statusCode;
      return ctx.response.body = response;
    }

    if (err instanceof HttpNotFoundError) {
      const response = HttpResponse.failed(err.message, err.statusCode);
      ctx.response.status = response.statusCode;
      return ctx.response.body = response;
    }

    if (err instanceof Error) {
      const response = HttpResponse.failed(
        "Error interno del servidor",
        Status.InternalServerError,
      );
      ctx.response.status = response.statusCode;
      return ctx.response.body = response;
    }
  }
});

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
