import { isIdValid } from "../../../../infrastructure/api/utils/isIdValid";
import { ValidationError } from "../../../../infrastructure/api/errors/validationError";
import { HttpResponse } from "../../../../infrastructure/api/httpResponse";
import { HttpNotFoundError } from "../../../../infrastructure/api/errors/httpNotFoundError";
import { TransactionByIdGetter } from "../../application/useCases/TransactionByIdGetter";
import { TransactionCreator } from "../../application/useCases/transactionCreator";
import { TransactionRemover } from "../../application/useCases/transactionRemover";
import { TransactionsRemover } from "../../application/useCases/transactionsRemover";
import { TransactionUpdater } from "../../application/useCases/transactionUpdater";
import { Request, Response } from "express";
import { TransactionImporter } from "../../application/useCases/TransactionImporter";
import { NextFunction } from "../../../../infrastructure/api/middlewares/BaseMiddleware";
import { catchAsync } from "../../../../application/utils/catchAsync";
import { ExcelTransactionParser } from "../services/excelTransactionParser";
import { CategoryClassifier } from "../../application/services/categoryClassifier";
import { MongoCategoryRepository } from "../../../category/infrastructure/database/mongoCategory.repository";
import { PdfStatementParser } from "../../application/useCases/PdfStatementParser";
import { PdfImportConfirmer } from "../../application/useCases/PdfImportConfirmer";
import { ConfirmRow } from "../../application/dto/pdfImportDTO";

export class TransactionController {
	constructor(
		private readonly transactionByIdGetter: TransactionByIdGetter,
		private readonly transactionCreator: TransactionCreator,
		private readonly transactionUpdater: TransactionUpdater,
		private readonly transactionRemover: TransactionRemover,
		private readonly transactionsRemover: TransactionsRemover,
		private readonly transactionImporter: TransactionImporter,
		private readonly pdfStatementParser: PdfStatementParser,
		private readonly pdfImportConfirmer: PdfImportConfirmer
	) {}

	getTransaction = catchAsync(async (req: Request, res: Response) => {
		const { id } = req.params;
		const transaction = await this.transactionByIdGetter.execute(id);

		if (!transaction) {
			throw new HttpNotFoundError("Transaction", id);
		}

		const responseBody = HttpResponse.success(transaction);
		res.status(responseBody.statusCode).json(responseBody);
	});

	saveTransaction = catchAsync(async (req: Request, res: Response) => {
		const body = await req.body;

		const transaction = await this.transactionCreator.execute({
			category: body.category,
			date: body.date,
			description: body.description,
			type: body.type,
			account: "",
			value: body.value,
		});

		const responseBody = HttpResponse.success(transaction);
		res.status(responseBody.statusCode).json(responseBody);
	});

	updateTransaction = catchAsync(async (req: Request, res: Response) => {
		const { id } = req.params;
		const body = await req.body;

		if (!isIdValid(id)) {
			throw new ValidationError().addError("id", `El id ${id} is inválido`);
		}

		const transaction = await this.transactionUpdater.execute(id, {
			category: body.category,
			date: body.date,
			description: body.description,
			type: body.type,
			account: body.account,
			value: body.value,
		});

		const responseBody = HttpResponse.success(transaction);
		res.status(responseBody.statusCode).json(responseBody);
	});

	deleteTransaction = catchAsync(async (req: Request, res: Response) => {
		const { id } = req.params;

		if (!isIdValid(id)) {
			throw new ValidationError().addError("id", `El id ${id} is inválido`);
		}

		await this.transactionRemover.execute(id);

		const responseBody = HttpResponse.success();
		res.status(responseBody.statusCode).json(responseBody);
	});

	deleteTransactions = catchAsync(async (req: Request, res: Response) => {
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
			ids as string[]
		);

		const responseBody = HttpResponse.success({ deletedCount });
		res.status(responseBody.statusCode).json(responseBody);
	});

	import = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			const { file } = req;

			if (!file) {
				throw new ValidationError({
					file: ["No se proporcionó un archivo"],
				});
			}

			const excelTransactionParser = new ExcelTransactionParser(
				new CategoryClassifier(),
				new MongoCategoryRepository()
			);
			await excelTransactionParser.parse(
				file.path,
				this.transactionImporter.execute
			);

			const responseBody = HttpResponse.success();
			res.status(responseBody.statusCode).json(responseBody);
		}
	);

	parsePdf = catchAsync(async (req: Request, res: Response) => {
		const { file } = req;

		if (!file) {
			throw new ValidationError({
				file: ["No se proporcionó un archivo"],
			});
		}

		const password =
			typeof req.body?.password === "string" ? req.body.password : undefined;

		const result = await this.pdfStatementParser.execute(
			file.buffer,
			file.originalname,
			password
		);

		const responseBody = HttpResponse.success(result);
		res.status(responseBody.statusCode).json(responseBody);
	});

	confirmPdfImport = catchAsync(async (req: Request, res: Response) => {
		const { importSessionId, rows } = req.body as {
			importSessionId: string;
			rows: ConfirmRow[];
		};

		if (!importSessionId || typeof importSessionId !== "string") {
			throw new ValidationError({
				importSessionId: ["El id de sesión es requerido"],
			});
		}

		if (!Array.isArray(rows)) {
			throw new ValidationError({ rows: ["Se requiere una lista de filas"] });
		}

		const result = await this.pdfImportConfirmer.execute(importSessionId, rows);

		const responseBody = HttpResponse.success(result);
		res.status(responseBody.statusCode).json(responseBody);
	});
}
