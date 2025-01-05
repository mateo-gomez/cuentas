import { CategoryByIdGetter } from "../features/category/application/categoryByIdGetter.ts";
import { CategoryCreator } from "../features/category/application/categoryCreator.ts";
import { CategoryGetter } from "../features/category/application/categoryGetter.ts";
import { CategoryRemover } from "../features/category/application/categoryRemover.ts";
import { CategoryUpdater } from "../features/category/application/categoryUpdater.ts";
import { TransactionByIdGetter } from "../features/transaction/application/TransactionByIdGetter.ts";
import { BalanceGetter } from "../features/transaction/application/balanceGetter.ts";
import { BalanceInRangeGetter } from "../features/transaction/application/balanceInRangeGetter.ts";
import { GroupedTransactionByDayGetter } from "../features/transaction/application/groupedTransactionByDayGetter.ts";
import { GroupedTransactionByDayInRangeGetter } from "../features/transaction/application/groupedTransactionByDayInRangeGetter.ts";
import { TransactionCreator } from "../features/transaction/application/transactionCreator.ts";
import { TransactionRemover } from "../features/transaction/application/transactionRemover.ts";
import { TransactionUpdater } from "../features/transaction/application/transactionUpdater.ts";
import { MongoCategoryRepository } from "../features/category/infrastructure/database/mongoCategory.repository.ts";
import { MongoTransactionRepository } from "../features/transaction/infrastructure/database/mongoTransaction.repository.ts";
import { TransactionAggregateService } from "../features/transaction/application/TransactionAggregateService.ts";
import { DateRangeGetter } from "../features/transaction/application/dateRangeGetter.ts";
import { AuthSignin } from "../features/auth/application/authSignin.ts";
import { MongoAuthRepository } from "../features/auth/infrastructure/database/mongoAuth.repository.ts";
import { AuthSignup } from "../features/auth/application/authSignup.ts";

const categoryRepository = new MongoCategoryRepository();
const transactionRepository = new MongoTransactionRepository();
const transactionAggregateService = new TransactionAggregateService();
const AuthRepository = new MongoAuthRepository();

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

  // grouped transactions
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

  dateRangeGetter: new DateRangeGetter(transactionRepository),

  // auth
  authSignin: new AuthSignin(AuthRepository),
  authSignup: new AuthSignup(AuthRepository),
};
