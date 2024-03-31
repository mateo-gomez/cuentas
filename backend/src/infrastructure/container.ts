import { CategoryByIdGetter } from "../application/useCases/category/categoryByIdGetter.ts";
import { CategoryCreator } from "../application/useCases/category/categoryCreator.ts";
import { CategoryGetter } from "../application/useCases/category/categoryGetter.ts";
import { CategoryRemover } from "../application/useCases/category/categoryRemover.ts";
import { CategoryUpdater } from "../application/useCases/category/categoryUpdater.ts";
import { TransactionByIdGetter } from "../application/useCases/transaction/TransactionByIdGetter.ts";
import { BalanceGetter } from "../application/useCases/transaction/balanceGetter.ts";
import { BalanceInRangeGetter } from "../application/useCases/transaction/balanceInRangeGetter.ts";
import { GroupedTransactionByDayGetter } from "../application/useCases/transaction/groupedTransactionByDayGetter.ts";
import { GroupedTransactionByDayInRangeGetter } from "../application/useCases/transaction/groupedTransactionByDayInRangeGetter.ts";
import { TransactionCreator } from "../application/useCases/transaction/transactionCreator.ts";
import { TransactionRemover } from "../application/useCases/transaction/transactionRemover.ts";
import { TransactionUpdater } from "../application/useCases/transaction/transactionUpdater.ts";
import { MongoCategoryRepository } from "./database/repositories/mongo/mongoCategory.repository.ts";
import { MongoTransactionRepository } from "./database/repositories/mongo/mongoTransaction.repository.ts";
import { TransactionAggregateService } from "../application/services/TransactionAggregateService.ts";

const categoryRepository = new MongoCategoryRepository();
const transactionRepository = new MongoTransactionRepository();
const transactionAggregateService = new TransactionAggregateService();

export const container = {
  // category
  categoryRepository,
  categoryByIdGetter: new CategoryByIdGetter(categoryRepository),
  categoryGetter: new CategoryGetter(categoryRepository),
  categoryCreator: new CategoryCreator(categoryRepository),
  categoryUpdater: new CategoryUpdater(categoryRepository),
  categoryRemover: new CategoryRemover(categoryRepository),

  // transaction
  transactionRepository,
  transactionByIdGetter: new TransactionByIdGetter(transactionRepository),
  transactionCreator: new TransactionCreator(transactionRepository),
  transactionUpdater: new TransactionUpdater(transactionRepository),
  transactionRemover: new TransactionRemover(transactionRepository),
  groupedTransactionByDayGetter: new GroupedTransactionByDayGetter(
    transactionRepository,
    transactionAggregateService,
  ),
  groupedTransactionByDayInRangeGetter:
    new GroupedTransactionByDayInRangeGetter(
      transactionRepository,
      transactionAggregateService,
    ),
  balanceInRangeGetter: new BalanceInRangeGetter(transactionRepository),
  balanceGetter: new BalanceGetter(transactionRepository),
};
