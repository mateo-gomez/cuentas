import { CategoryByIdGetter } from "../features/category/application/categoryByIdGetter";
import { CategoryCreator } from "../features/category/application/categoryCreator";
import { CategoryGetter } from "../features/category/application/categoryGetter";
import { CategoryRemover } from "../features/category/application/categoryRemover";
import { CategoryUpdater } from "../features/category/application/categoryUpdater";
import { TransactionByIdGetter } from "../features/transaction/application/TransactionByIdGetter";
import { BalanceGetter } from "../features/transaction/application/balanceGetter";
import { BalanceInRangeGetter } from "../features/transaction/application/balanceInRangeGetter";
import { GroupedTransactionByDayGetter } from "../features/transaction/application/groupedTransactionByDayGetter";
import { GroupedTransactionByDayInRangeGetter } from "../features/transaction/application/groupedTransactionByDayInRangeGetter";
import { TransactionCreator } from "../features/transaction/application/transactionCreator";
import { TransactionRemover } from "../features/transaction/application/transactionRemover";
import { TransactionUpdater } from "../features/transaction/application/transactionUpdater";
import { MongoCategoryRepository } from "../features/category/infrastructure/database/mongoCategory.repository";
import { MongoTransactionRepository } from "../features/transaction/infrastructure/database/mongoTransaction.repository";
import { TransactionAggregateService } from "../features/transaction/application/TransactionAggregateService";
import { DateRangeGetter } from "../features/transaction/application/dateRangeGetter";
import { AuthSignin } from "../features/auth/application/authSignin";
import { MongoAuthRepository } from "../features/auth/infrastructure/database/mongoAuth.repository";
import { AuthSignup } from "../features/auth/application/authSignup";

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
