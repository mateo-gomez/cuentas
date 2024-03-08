import { Router } from "../deps.ts";
import {
	getAllTransactions,
	getTransaction,
	saveTransaction,
	updateTransaction,
	getTransactionsBy,
} from "../Controllers/transaction.controller.ts";

const router = new Router();

router
	.get("/transactions", getAllTransactions)
	.get("/transactions/(year|month|week|day)", getTransactionsBy)
	.get("/transactions/year/:year([0-9]{4})", getTransactionsBy)

	.get("/transactions/:id", getTransaction)
	.post("/transactions", saveTransaction)
	.put("/transactions/:id", updateTransaction);

export default router;
