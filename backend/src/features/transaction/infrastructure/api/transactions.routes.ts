import { Router } from "../../../../../deps.ts";
import { container } from "../../../../infrastructure/container.ts";
import { DatesController } from "./dates.controller.ts";
import { TransactionController } from "./transaction.controller.ts";
import { TransactionAggregateController } from "./transactionAggregate.controller.ts";

const transactionController = new TransactionController(
  container.transactionByIdGetter,
  container.transactionCreator,
  container.transactionUpdater,
  container.transactionRemover,
);

const transactionAggregateController = new TransactionAggregateController(
  container.groupedTransactionByDayGetter,
  container.groupedTransactionByDayInRangeGetter,
  container.balanceInRangeGetter,
  container.balanceGetter,
);

const datesController = new DatesController(
  container.dateRangeGetter,
);

const router = new Router();

router
  .get("/transactions/dates", datesController.dateRange)
  .get("/transactions", transactionAggregateController.getAllTransactions)
  .get("/transactions/:id", transactionController.getTransaction)
  .post("/transactions", transactionController.saveTransaction)
  .put("/transactions/:id", transactionController.updateTransaction)
  .delete("/transactions/:id", transactionController.deleteTransaction);

export default router;
