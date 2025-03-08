import { container } from "../../../../infrastructure/container";
import { DatesController } from "./dates.controller";
import { TransactionController } from "./transaction.controller";
import { TransactionAggregateController } from "./transactionAggregate.controller";
import { Router } from "express";

const transactionController = new TransactionController(
	container.transactionByIdGetter,
	container.transactionCreator,
	container.transactionUpdater,
	container.transactionRemover
);

const transactionAggregateController = new TransactionAggregateController(
	container.groupedTransactionByDayGetter,
	container.groupedTransactionByDayInRangeGetter,
	container.balanceInRangeGetter,
	container.balanceGetter
);

const datesController = new DatesController(container.dateRangeGetter);

const router = Router();

router
	.get("/dates", datesController.dateRange)
	.get("/", transactionAggregateController.getAllTransactions)
	.get("/:id", transactionController.getTransaction)
	.post("/", transactionController.saveTransaction)
	.put("/:id", transactionController.updateTransaction)
	.delete("/:id", transactionController.deleteTransaction);

export default router;
