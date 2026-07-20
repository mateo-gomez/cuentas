import { isIdValid } from "../../../../infrastructure/api/utils/isIdValid";
import { ValidationError } from "../../../../infrastructure/api/errors/validationError";
import { HttpResponse } from "../../../../infrastructure/api/httpResponse";
import { HttpNotFoundError } from "../../../../infrastructure/api/errors/httpNotFoundError";
import { TransactionByIdGetter } from "../../application/useCases/TransactionByIdGetter";
import { TransactionCreator } from "../../application/useCases/transactionCreator";
import { CreateTransfer } from "../../application/useCases/CreateTransfer";
import { TransactionRemover } from "../../application/useCases/transactionRemover";
import { TransactionsRemover } from "../../application/useCases/transactionsRemover";
import { TransactionUpdater } from "../../application/useCases/transactionUpdater";
import { Response } from "express";
import { TransactionImporter } from "../../application/useCases/TransactionImporter";
import {
	NextFunction,
	RequestAuthenticated,
} from "../../../../infrastructure/api/middlewares/BaseMiddleware";
import { catchAsync } from "../../../../application/utils/catchAsync";
import { ExcelTransactionParser } from "../services/excelTransactionParser";
import { CategoryClassifier } from "../../application/services/categoryClassifier";
import { MongoCategoryRepository } from "../../../category/infrastructure/database/mongoCategory.repository";
import { PdfStatementParser } from "../../application/useCases/PdfStatementParser";
import { PdfImportConfirmer } from "../../application/useCases/PdfImportConfirmer";
import { ConfirmRow } from "../../application/dto/pdfImportDTO";
import { AccountByIdGetter } from "../../../account/application/accountByIdGetter";
import { AccountRepository } from "../../../account/domain/account.repository";
import { FrequentCombosGetter } from "../../application/useCases/FrequentCombosGetter";
import { CategoryRepository } from "../../../category/domain/category.repository";
import { Transaction } from "../../domain/transaction.entity";
import {
	TRANSFER_CATEGORY_ICON,
	TRANSFER_CATEGORY_NAME,
} from "../../../category/domain/defaultCategories";

const MAX_FREQUENT_LIMIT = 20;

export class TransactionController {
	constructor(
		private readonly transactionByIdGetter: TransactionByIdGetter,
		private readonly transactionCreator: TransactionCreator,
		private readonly createTransfer: CreateTransfer,
		private readonly transactionUpdater: TransactionUpdater,
		private readonly transactionRemover: TransactionRemover,
		private readonly transactionsRemover: TransactionsRemover,
		private readonly transactionImporter: TransactionImporter,
		private readonly pdfStatementParser: PdfStatementParser,
		private readonly pdfImportConfirmer: PdfImportConfirmer,
		private readonly accountByIdGetter: AccountByIdGetter,
		private readonly accountRepository: AccountRepository,
		private readonly frequentCombosGetter: FrequentCombosGetter,
		private readonly categoryRepository: CategoryRepository
	) {}

	// Categories are optional ("Sin categoría"). When one is supplied, re-validate
	// that it is a well-formed id AND still belongs to the caller — the client may
	// send a stale category id (renamed/deleted between suggestion caching and tap),
	// and persisting an orphaned ref would surface as a null category on read.
	private resolveOwnedCategoryId = async (
		userId: string,
		category: unknown
	): Promise<string | undefined> => {
		if (category === undefined || category === null || category === "") {
			return undefined;
		}

		if (typeof category !== "string" || !isIdValid(category)) {
			throw new ValidationError().addError("category", "Categoría inválida");
		}

		const exists = await this.categoryRepository.existsForUser(userId, category);

		if (!exists) {
			throw new ValidationError().addError("category", "Categoría inválida");
		}

		return category;
	};

	private resolveOwnedAccountId = async (
		userId: string,
		accountId: unknown
	): Promise<string> => {
		if (!accountId || typeof accountId !== "string" || !isIdValid(accountId)) {
			throw new ValidationError().addError(
				"accountId",
				"Se requiere una cuenta válida"
			);
		}

		const account = await this.accountByIdGetter.execute(userId, accountId);

		if (!account) {
			throw new ValidationError().addError("accountId", "Cuenta inválida");
		}

		return accountId;
	};

	// Both legs of a transfer are tagged with the user's "Transferencias"
	// category. It is seeded by UserDefaultsBootstrapper, but create it on the
	// fly if a legacy user is missing it so transfers never fail.
	private resolveTransferCategoryId = async (
		userId: string
	): Promise<string> => {
		const existing = await this.categoryRepository.getByNameForUser(
			userId,
			TRANSFER_CATEGORY_NAME
		);

		if (existing) {
			return existing._id;
		}

		const created = await this.categoryRepository.createCategory(
			userId,
			TRANSFER_CATEGORY_NAME,
			TRANSFER_CATEGORY_ICON
		);

		return created._id;
	};

	getTransaction = catchAsync(async (req: RequestAuthenticated, res: Response) => {
		const userId = req.user!.id;
		const { id } = req.params;
		const transaction = await this.transactionByIdGetter.execute(userId, id);

		if (!transaction) {
			throw new HttpNotFoundError("Transaction", id);
		}

		const responseBody = HttpResponse.success(transaction);
		res.status(responseBody.statusCode).json(responseBody);
	});

	saveTransaction = catchAsync(async (req: RequestAuthenticated, res: Response) => {
		const userId = req.user!.id;
		const body = await req.body;

		const accountId = await this.resolveOwnedAccountId(userId, body.accountId);
		const category = await this.resolveOwnedCategoryId(userId, body.category);

		const transaction = await this.transactionCreator.execute({
			// Write path carries the category id; `Transaction.category` types the
			// populated read shape, so the ref id is cast through here.
			category: category as unknown as Transaction["category"],
			date: body.date,
			description: body.description,
			type: body.type,
			account: "",
			userId,
			accountId,
			value: body.value,
		});

		const responseBody = HttpResponse.success(transaction);
		res.status(responseBody.statusCode).json(responseBody);
	});

	saveTransfer = catchAsync(async (req: RequestAuthenticated, res: Response) => {
		const userId = req.user!.id;
		const body = await req.body;

		const fromAccountId = await this.resolveOwnedAccountId(
			userId,
			body.fromAccountId
		);
		const toAccountId = await this.resolveOwnedAccountId(
			userId,
			body.toAccountId
		);

		if (fromAccountId === toAccountId) {
			throw new ValidationError().addError(
				"toAccountId",
				"La cuenta origen y destino deben ser distintas"
			);
		}

		const value = Number(body.value);
		if (!Number.isFinite(value) || value <= 0) {
			throw new ValidationError().addError(
				"value",
				"El monto debe ser un número positivo"
			);
		}

		const date = body.date ? new Date(body.date) : new Date();
		if (Number.isNaN(date.getTime())) {
			throw new ValidationError().addError("date", "Fecha inválida");
		}

		const categoryId = await this.resolveTransferCategoryId(userId);

		const result = await this.createTransfer.execute({
			userId,
			fromAccountId,
			toAccountId,
			value,
			date,
			description:
				typeof body.description === "string" ? body.description : "",
			categoryId,
		});

		const responseBody = HttpResponse.success(result);
		res.status(responseBody.statusCode).json(responseBody);
	});

	updateTransaction = catchAsync(async (req: RequestAuthenticated, res: Response) => {
		const userId = req.user!.id;
		const { id } = req.params;
		const body = await req.body;

		if (!isIdValid(id)) {
			throw new ValidationError().addError("id", `El id ${id} is inválido`);
		}

		const accountId = await this.resolveOwnedAccountId(userId, body.accountId);
		const category = await this.resolveOwnedCategoryId(userId, body.category);

		const transaction = await this.transactionUpdater.execute(userId, id, {
			// See saveTransaction: id on the write path, populated shape on read.
			category: category as unknown as Transaction["category"],
			date: body.date,
			description: body.description,
			type: body.type,
			userId,
			accountId,
			value: body.value,
		});

		const responseBody = HttpResponse.success(transaction);
		res.status(responseBody.statusCode).json(responseBody);
	});

	deleteTransaction = catchAsync(async (req: RequestAuthenticated, res: Response) => {
		const userId = req.user!.id;
		const { id } = req.params;

		if (!isIdValid(id)) {
			throw new ValidationError().addError("id", `El id ${id} is inválido`);
		}

		await this.transactionRemover.execute(userId, id);

		const responseBody = HttpResponse.success();
		res.status(responseBody.statusCode).json(responseBody);
	});

	deleteTransactions = catchAsync(async (req: RequestAuthenticated, res: Response) => {
		const userId = req.user!.id;
		const { ids } = req.body as { ids: unknown };

		if (!Array.isArray(ids) || ids.length === 0) {
			throw new ValidationError().addError(
				"ids",
				"Se requiere una lista de ids"
			);
		}

		const invalidId = ids.find((id) => !isIdValid(id));
		if (invalidId !== undefined) {
			throw new ValidationError().addError(
				"ids",
				`El id ${invalidId} is inválido`
			);
		}

		const deletedCount = await this.transactionsRemover.execute(
			userId,
			ids as string[]
		);

		const responseBody = HttpResponse.success({ deletedCount });
		res.status(responseBody.statusCode).json(responseBody);
	});

	import = catchAsync(
		async (req: RequestAuthenticated, res: Response, next: NextFunction) => {
			const userId = req.user!.id;
			const { file } = req;

			if (!file) {
				throw new ValidationError({
					file: ["No se proporcionó un archivo"],
				});
			}

			// Excel importer is out of scope for account selection (R6 non-goal);
			// minimally wire it to the user's default "Sin asignar" account so
			// TransactionDTO's required accountId stays satisfied.
			const defaultAccount = await this.accountRepository.getDefaultForUser(userId);

			if (!defaultAccount) {
				throw new ValidationError().addError(
					"account",
					"No se encontró la cuenta por defecto del usuario"
				);
			}

			const excelTransactionParser = new ExcelTransactionParser(
				new CategoryClassifier(),
				new MongoCategoryRepository()
			);
			await excelTransactionParser.parse(
				file.path,
				this.transactionImporter.execute,
				userId,
				defaultAccount._id
			);

			const responseBody = HttpResponse.success();
			res.status(responseBody.statusCode).json(responseBody);
		}
	);

	parsePdf = catchAsync(async (req: RequestAuthenticated, res: Response) => {
		const userId = req.user!.id;
		const { file } = req;

		if (!file) {
			throw new ValidationError({
				file: ["No se proporcionó un archivo"],
			});
		}

		const password =
			typeof req.body?.password === "string" ? req.body.password : undefined;

		const result = await this.pdfStatementParser.execute(
			userId,
			file.buffer,
			file.originalname,
			password
		);

		const responseBody = HttpResponse.success(result);
		res.status(responseBody.statusCode).json(responseBody);
	});

	confirmPdfImport = catchAsync(async (req: RequestAuthenticated, res: Response) => {
		const userId = req.user!.id;
		const { importSessionId, rows, accountId } = req.body as {
			importSessionId: string;
			rows: ConfirmRow[];
			accountId?: unknown;
		};

		if (!importSessionId || typeof importSessionId !== "string") {
			throw new ValidationError({
				importSessionId: ["El id de sesión es requerido"],
			});
		}

		if (!Array.isArray(rows)) {
			throw new ValidationError({ rows: ["Se requiere una lista de filas"] });
		}

		// One account per import batch (R9) — not per row.
		const ownedAccountId = await this.resolveOwnedAccountId(userId, accountId);

		// Transfer rows (e.g. card payments) name a destination account. Validate
		// each distinct target belongs to the caller before persisting.
		const transferTargets = new Set(
			rows
				.filter((row) => row?.isTransfer && !row.excluded)
				.map((row) => row.transferToAccountId)
		);
		for (const target of transferTargets) {
			await this.resolveOwnedAccountId(userId, target);
		}

		const result = await this.pdfImportConfirmer.execute(
			importSessionId,
			rows,
			userId,
			ownedAccountId
		);

		const responseBody = HttpResponse.success(result);
		res.status(responseBody.statusCode).json(responseBody);
	});

	getFrequent = catchAsync(async (req: RequestAuthenticated, res: Response) => {
		const userId = req.user!.id;

		const rawAccountId = req.query.accountId;
		let accountId: string | undefined;
		if (typeof rawAccountId === "string" && rawAccountId.length > 0) {
			if (!isIdValid(rawAccountId)) {
				throw new ValidationError().addError(
					"accountId",
					"Se requiere una cuenta válida"
				);
			}
			accountId = rawAccountId;
		}

		const rawLimit = req.query.limit;
		let limit: number | undefined;
		if (typeof rawLimit === "string" && rawLimit.length > 0) {
			const parsedLimit = Number(rawLimit);
			if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
				throw new ValidationError().addError(
					"limit",
					"El límite debe ser un número entero positivo"
				);
			}
			limit = Math.min(parsedLimit, MAX_FREQUENT_LIMIT);
		}

		const combos = await this.frequentCombosGetter.execute(userId, accountId, limit);

		const responseBody = HttpResponse.success(combos);
		res.status(responseBody.statusCode).json(responseBody);
	});
}
