import categoryRouter from "../../../features/category/infrastructure/api/categories.routes.ts";
import transactionRouter from "../../../features/transaction/infrastructure/api/transactions.routes.ts";
import authRouter from "../../../features/auth/infrastructure/api/auth.routes.ts";

export const routes = [
  categoryRouter,
  transactionRouter,
  authRouter,
];
