import { Router } from "../../../../deps.ts";
import { container } from "../../container.ts";
import {
  TransactionController,
} from "../Controllers/transaction.controller.ts";
import { TransactionAggregateController } from "../Controllers/transactionAggregate.controller.ts";

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

const router = new Router();

router
  .get("/transactions", transactionAggregateController.getAllTransactions)
  .get("/transactions/:id", transactionController.getTransaction)
  .post("/transactions", transactionController.saveTransaction)
  .put("/transactions/:id", transactionController.updateTransaction)
  .delete("/transactions/:id", transactionController.deleteTransaction);

export default router;
