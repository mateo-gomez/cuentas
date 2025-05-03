import { isIdValid } from "../../../../infrastructure/api/utils/isIdValid";
import { ValidationError } from "../../../../infrastructure/api/errors/validationError";
import { HttpResponse } from "../../../../infrastructure/api/httpResponse";
import { HttpNotFoundError } from "../../../../infrastructure/api/errors/httpNotFoundError";
import { TransactionByIdGetter } from "../../application/useCases/TransactionByIdGetter";
import { TransactionCreator } from "../../application/useCases/transactionCreator";
import { TransactionRemover } from "../../application/useCases/transactionRemover";
import { TransactionUpdater } from "../../application/useCases/transactionUpdater";
import { Request, Response } from "express";
import { TransactionImporter } from "../../application/useCases/TransactionImporter";
import { NextFunction } from "../../../../infrastructure/api/middlewares/BaseMiddleware";
import { catchAsync } from "../../../../application/utils/catchAsync";
import { ExcelTransactionParser } from "../services/excelTransactionParser";
import { CategoryClassifier } from "../../application/services/categoryClassifier";
import { MongoCategoryRepository } from "../../../category/infrastructure/database/mongoCategory.repository";

export class TransactionController {
	constructor(
		private readonly transactionByIdGetter: TransactionByIdGetter,
		private readonly transactionCreator: TransactionCreator,
		private readonly transactionUpdater: TransactionUpdater,
		private readonly transactionRemover: TransactionRemover,
		private readonly transactionImporter: TransactionImporter
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
}
