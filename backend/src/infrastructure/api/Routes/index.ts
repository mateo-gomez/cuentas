import categoryRouter from "../../../features/category/infrastructure/api/categories.routes";
import transactionRouter from "../../../features/transaction/infrastructure/api/transactions.routes";
import authRouter from "../../../features/auth/infrastructure/api/auth.routes";

export const routes = [
  categoryRouter,
  transactionRouter,
  authRouter,
];
