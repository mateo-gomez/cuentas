import categoryRouter from "../../../features/category/infrastructure/api/categories.routes";
import transactionRouter from "../../../features/transaction/infrastructure/api/transactions.routes";
import authRouter from "../../../features/auth/infrastructure/api/auth.routes";
import budgetRouter from "../../../features/budget/infrastructure/api/budget.routes";
import accountRouter from "../../../features/account/infrastructure/api/accounts.routes";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { Route } from "../../types/Route";

export const routes: Route[] = [
	{
		path: "/categories",
		middleware: AuthMiddleware.handle(),
		router: categoryRouter,
	},
	{
		path: "/transactions",
		middleware: AuthMiddleware.handle(),
		router: transactionRouter,
	},
	{
		path: "/budget",
		middleware: AuthMiddleware.handle(),
		router: budgetRouter,
	},
	{
		path: "/accounts",
		middleware: AuthMiddleware.handle(),
		router: accountRouter,
	},
	{ path: "/auth", router: authRouter },
];
