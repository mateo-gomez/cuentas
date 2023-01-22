import {
  Application,
  isHttpError,
  ListenOptionsBase,
  Status,
} from "https://deno.land/x/oak@v11.1.0/mod.ts";

import categoriesRouter from "./Routes/categories.routes.ts";
import transactionsRouter from "./Routes/transactions.routes.ts";

const app = new Application();

app.use(categoriesRouter.routes());
app.use(categoriesRouter.allowedMethods());
app.use(transactionsRouter.routes());
app.use(transactionsRouter.allowedMethods());

app.addEventListener("error", (evt) => {
  // Will log the thrown error to the console.
  console.log(evt.error);
});

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (isHttpError(err)) {
      switch (err.status) {
        case Status.InternalServerError:
          ctx.response.status = err.status;
          // ctx.response.body({ message: err.message });
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

const options: ListenOptionsBase = { port: 8000 };

await app.listen(options);
