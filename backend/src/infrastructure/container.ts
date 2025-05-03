import { CategoryByIdGetter } from "../features/category/application/categoryByIdGetter";
import { CategoryCreator } from "../features/category/application/categoryCreator";
import { CategoryGetter } from "../features/category/application/categoryGetter";
import { CategoryRemover } from "../features/category/application/categoryRemover";
import { CategoryUpdater } from "../features/category/application/categoryUpdater";
import { TransactionByIdGetter } from "../features/transaction/application/useCases/TransactionByIdGetter";
import { BalanceGetter } from "../features/transaction/application/useCases/balanceGetter";
import { BalanceInRangeGetter } from "../features/transaction/application/useCases/balanceInRangeGetter";
import { GroupedTransactionByDayGetter } from "../features/transaction/application/useCases/groupedTransactionByDayGetter";
import { GroupedTransactionByDayInRangeGetter } from "../features/transaction/application/useCases/groupedTransactionByDayInRangeGetter";
import { TransactionCreator } from "../features/transaction/application/useCases/transactionCreator";
import { TransactionRemover } from "../features/transaction/application/useCases/transactionRemover";
import { TransactionUpdater } from "../features/transaction/application/useCases/transactionUpdater";
import { MongoCategoryRepository } from "../features/category/infrastructure/database/mongoCategory.repository";
import { MongoTransactionRepository } from "../features/transaction/infrastructure/database/mongoTransaction.repository";
import { TransactionAggregateService } from "../features/transaction/application/services/TransactionAggregateService";
import { DateRangeGetter } from "../features/transaction/application/useCases/dateRangeGetter";
import { AuthSignin } from "../features/auth/application/authSignin";
import { MongoAuthRepository } from "../features/auth/infrastructure/database/mongoAuth.repository";
import { AuthSignup } from "../features/auth/application/authSignup";
import { AuthService } from "../application/services/auth.service";

const categoryRepository = new MongoCategoryRepository();
const transactionRepository = new MongoTransactionRepository();
const transactionAggregateService = new TransactionAggregateService();
const authRepository = new MongoAuthRepository();
const authService = new AuthService();

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
		transactionAggregateService
	),
	groupedTransactionByDayInRangeGetter:
		new GroupedTransactionByDayInRangeGetter(
			transactionRepository,
			transactionAggregateService
		),
	balanceInRangeGetter: new BalanceInRangeGetter(transactionRepository),
	balanceGetter: new BalanceGetter(transactionRepository),

	dateRangeGetter: new DateRangeGetter(transactionRepository),

	// auth
	authService,
	authSignin: new AuthSignin(authRepository, authService),
	authSignup: new AuthSignup(authRepository),
};
