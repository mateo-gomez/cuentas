import { UploadMiddleware } from "../../../../infrastructure/api/middlewares/uploadMiddleware";
import { container } from "../../../../infrastructure/container";
import { DatesController } from "./dates.controller";
import { TransactionController } from "./transaction.controller";
import { TransactionAggregateController } from "./transactionAggregate.controller";
import { Router } from "express";

const transactionController = new TransactionController(
	container.transactionByIdGetter,
	container.transactionCreator,
	container.createTransfer,
	container.transactionUpdater,
	container.transactionRemover,
	container.transactionsRemover,
	container.transactionImporter,
	container.pdfStatementParser,
	container.pdfImportConfirmer,
	container.accountByIdGetter,
	container.accountRepository,
	container.frequentCombosGetter,
	container.categoryRepository
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
	// MUST stay before "/:id" — Express matches params greedily, so "frequent"
	// would otherwise be parsed as a transaction id.
	.get("/frequent", transactionController.getFrequent)
	.get("/", transactionAggregateController.getAllTransactions)
	.get("/:id", transactionController.getTransaction)
	.post("/bulk-delete", transactionController.deleteTransactions)
	.post("/transfer", transactionController.saveTransfer)
	.post("/", transactionController.saveTransaction)
	.put("/:id", transactionController.updateTransaction)
	.delete("/:id", transactionController.deleteTransaction)
	.post(
		"/import",
		UploadMiddleware.handle([
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		]).single("file"),
		transactionController.import
	)
	.post(
		"/import/pdf",
		UploadMiddleware.memory(["application/pdf"]).single("file"),
		transactionController.parsePdf
	)
	.post("/import/pdf/confirm", transactionController.confirmPdfImport);

export default router;
