import { Router } from "../../../deps.ts";
import { BalanceGetter } from "../../application/useCases/transaction/balanceGetter.ts";
import { BalanceInRangeGetter } from "../../application/useCases/transaction/balanceInRangeGetter.ts";
import { GroupedTransactionByDayGetter } from "../../application/useCases/transaction/groupedTransactionByDayGetter.ts";
import { GroupedTransactionByDayInRangeGetter } from "../../application/useCases/transaction/groupedTransactionByDayInRangeGetter.ts";
import { TransactionCreator } from "../../application/useCases/transaction/transactionCreator.ts";
import { TransactionByIdGetter } from "../../application/useCases/transaction/TransactionByIdGetter.ts";
import { TransactionRemover } from "../../application/useCases/transaction/transactionRemover.ts";
import { TransactionUpdater } from "../../application/useCases/transaction/transactionUpdater.ts";
import {
  TransactionController,
} from "../Controllers/transaction.controller.ts";
import { TransactionAggregateController } from "../Controllers/transactionAggregate.controller.ts";
import { MongoTransactionRepository } from "../implementations/mongo/mongoTransaction.repository.ts";

const transactionRepository = new MongoTransactionRepository();

const transactionController = new TransactionController(
  new TransactionByIdGetter(transactionRepository),
  new TransactionCreator(transactionRepository),
  new TransactionUpdater(transactionRepository),
  new TransactionRemover(transactionRepository),
);

const transactionAggregateController = new TransactionAggregateController(
  new GroupedTransactionByDayGetter(transactionRepository),
  new GroupedTransactionByDayInRangeGetter(transactionRepository),
  new BalanceInRangeGetter(transactionRepository),
  new BalanceGetter(transactionRepository),
);

const router = new Router();

router
  .get("/transactions", transactionAggregateController.getAllTransactions)
  .get("/transactions/:id", transactionController.getTransaction)
  .post("/transactions", transactionController.saveTransaction)
  .put("/transactions/:id", transactionController.updateTransaction)
  .delete("/transactions/:id", transactionController.deleteTransaction);

export default router;
