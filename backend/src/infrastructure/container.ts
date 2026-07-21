import { CategoryReportGetter } from "../features/report/application/useCases/CategoryReportGetter";
import { CategoryTrendGetter } from "../features/report/application/useCases/CategoryTrendGetter";
import { CategoryByIdGetter } from "../features/category/application/categoryByIdGetter";
import { CategoryCreator } from "../features/category/application/categoryCreator";
import { CategoryGetter } from "../features/category/application/categoryGetter";
import { CategoryRemover } from "../features/category/application/categoryRemover";
import { CategoryUpdater } from "../features/category/application/categoryUpdater";
import { TransactionByIdGetter } from "../features/transaction/application/useCases/TransactionByIdGetter";
import { FrequentCombosGetter } from "../features/transaction/application/useCases/FrequentCombosGetter";
import { BalanceGetter } from "../features/transaction/application/useCases/balanceGetter";
import { BalanceInRangeGetter } from "../features/transaction/application/useCases/balanceInRangeGetter";
import { GroupedTransactionByDayGetter } from "../features/transaction/application/useCases/groupedTransactionByDayGetter";
import { GroupedTransactionByDayInRangeGetter } from "../features/transaction/application/useCases/groupedTransactionByDayInRangeGetter";
import { TransactionCreator } from "../features/transaction/application/useCases/transactionCreator";
import { CreateTransfer } from "../features/transaction/application/useCases/CreateTransfer";
import { TransactionRemover } from "../features/transaction/application/useCases/transactionRemover";
import { TransactionsRemover } from "../features/transaction/application/useCases/transactionsRemover";
import { AllTransactionsRemover } from "../features/transaction/application/useCases/allTransactionsRemover";
import { TransactionUpdater } from "../features/transaction/application/useCases/transactionUpdater";
import { MongoCategoryRepository } from "../features/category/infrastructure/database/mongoCategory.repository";
import { MongoTransactionRepository } from "../features/transaction/infrastructure/database/mongoTransaction.repository";
import { TransactionAggregateService } from "../features/transaction/application/services/TransactionAggregateService";
import { DateRangeGetter } from "../features/transaction/application/useCases/dateRangeGetter";
import { AuthSignin } from "../features/auth/application/authSignin";
import { MongoAuthRepository } from "../features/auth/infrastructure/database/mongoAuth.repository";
import { AuthSignup } from "../features/auth/application/authSignup";
import { AuthService } from "../application/services/auth.service";
import { AuthRefresh } from "../features/auth/application/authRefresh";
import { AuthLogout } from "../features/auth/application/authLogout";
import { GetCurrentUser } from "../features/auth/application/getCurrentUser";
import { UpdateProfile } from "../features/auth/application/updateProfile";
import { ChangePassword } from "../features/auth/application/changePassword";
import { RefreshTokenIssuer } from "../features/auth/application/refreshTokenIssuer";
import { MongoRefreshTokenRepository } from "../features/auth/infrastructure/database/mongoRefreshToken.repository";
import { TransactionImporter } from "../features/transaction/application/useCases/TransactionImporter";
import { ExcelTransactionParser } from "../features/transaction/infrastructure/services/excelTransactionParser";
import { CategoryClassifier } from "../features/transaction/application/services/categoryClassifier";
import { BudgetGetter } from "../features/budget/application/budgetGetter";
import { BudgetUpsert } from "../features/budget/application/budgetUpsert";
import { MongoBudgetRepository } from "../features/budget/infrastructure/database/mongoBudget.repository";
import { PdfStatementParser } from "../features/transaction/application/useCases/PdfStatementParser";
import { PdfImportConfirmer } from "../features/transaction/application/useCases/PdfImportConfirmer";
import { HttpPdfBankParser } from "../features/transaction/infrastructure/services/HttpPdfBankParser";
import { InMemoryPreviewStore } from "../features/transaction/infrastructure/services/InMemoryPreviewStore";
import { MongoAccountRepository } from "../features/account/infrastructure/database/mongoAccount.repository";
import { AccountByIdGetter } from "../features/account/application/accountByIdGetter";
import { AccountGetter } from "../features/account/application/accountGetter";
import { AccountCreator } from "../features/account/application/accountCreator";
import { AccountUpdater } from "../features/account/application/accountUpdater";
import { AccountRemover } from "../features/account/application/accountRemover";
import { AccountEmptier } from "../features/account/application/accountEmptier";
import { AccountBalanceGetter } from "../features/account/application/accountBalanceGetter";
import { AccountDefaultGetter } from "../features/account/application/accountDefaultGetter";
import { UserDefaultsBootstrapper } from "../features/account/application/userDefaultsBootstrapper";
import { TransactionAccountMigrator } from "../features/transaction/application/useCases/TransactionAccountMigrator";

const categoryRepository = new MongoCategoryRepository();
const transactionRepository = new MongoTransactionRepository();
const transactionAggregateService = new TransactionAggregateService();
const authRepository = new MongoAuthRepository();
const authService = new AuthService();
const refreshTokenRepository = new MongoRefreshTokenRepository();
const refreshTokenIssuer = new RefreshTokenIssuer(
	authService,
	refreshTokenRepository
);
const budgetRepository = new MongoBudgetRepository();
// Shared so CategoryTrendGetter can reuse the same per-range aggregation.
const reportCategoryGetter = new CategoryReportGetter(transactionRepository);
const transactionImporter = new TransactionImporter(transactionRepository);
const httpPdfBankParser = new HttpPdfBankParser();
const inMemoryPreviewStore = new InMemoryPreviewStore();
const accountRepository = new MongoAccountRepository();

export const container = {
	// category
	categoryRepository,
	categoryByIdGetter: new CategoryByIdGetter(categoryRepository),
	categoryGetter: new CategoryGetter(categoryRepository),
	categoryCreator: new CategoryCreator(categoryRepository),
	categoryUpdater: new CategoryUpdater(categoryRepository),
	categoryRemover: new CategoryRemover(categoryRepository),

	// account
	accountRepository,
	accountByIdGetter: new AccountByIdGetter(accountRepository),
	accountGetter: new AccountGetter(accountRepository),
	accountCreator: new AccountCreator(accountRepository),
	accountUpdater: new AccountUpdater(accountRepository),
	accountRemover: new AccountRemover(accountRepository, transactionRepository),
	accountEmptier: new AccountEmptier(accountRepository, transactionRepository),
	accountBalanceGetter: new AccountBalanceGetter(accountRepository, transactionRepository),
	accountDefaultGetter: new AccountDefaultGetter(accountRepository),

	// per-user defaults bootstrap + one-time legacy backfill (triggered at signin/signup)
	userDefaultsBootstrapper: new UserDefaultsBootstrapper(
		accountRepository,
		categoryRepository
	),
	transactionAccountMigrator: new TransactionAccountMigrator(
		transactionRepository,
		categoryRepository
	),

	// transaction
	transactionRepository,
	transactionByIdGetter: new TransactionByIdGetter(transactionRepository),
	frequentCombosGetter: new FrequentCombosGetter(transactionRepository),
	transactionCreator: new TransactionCreator(transactionRepository),
	createTransfer: new CreateTransfer(transactionRepository),
	transactionUpdater: new TransactionUpdater(transactionRepository),
	transactionRemover: new TransactionRemover(transactionRepository),
	transactionsRemover: new TransactionsRemover(transactionRepository),
	allTransactionsRemover: new AllTransactionsRemover(transactionRepository),
	transactionImporter,

	// pdf import
	pdfStatementParser: new PdfStatementParser(
		httpPdfBankParser,
		inMemoryPreviewStore,
		transactionRepository
	),
	pdfImportConfirmer: new PdfImportConfirmer(
		inMemoryPreviewStore,
		categoryRepository,
		transactionImporter,
		new CreateTransfer(transactionRepository)
	),

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

	// report
	categoryReportGetter: reportCategoryGetter,
	categoryTrendGetter: new CategoryTrendGetter(reportCategoryGetter),

	// auth
	authService,
	refreshTokenRepository,
	authSignin: new AuthSignin(authRepository, refreshTokenIssuer),
	authSignup: new AuthSignup(authRepository),
	authRefresh: new AuthRefresh(
		authService,
		refreshTokenRepository,
		refreshTokenIssuer
	),
	authLogout: new AuthLogout(authService, refreshTokenRepository),
	getCurrentUser: new GetCurrentUser(authRepository),
	updateProfile: new UpdateProfile(authRepository),
	changePassword: new ChangePassword(authRepository),

	// excelTransactionParser
	excelTransactionParser: new ExcelTransactionParser(
		new CategoryClassifier(),
		categoryRepository
	),

	// budget
	budgetRepository,
	budgetGetter: new BudgetGetter(budgetRepository, transactionRepository),
	budgetUpsert: new BudgetUpsert(budgetRepository),
};
