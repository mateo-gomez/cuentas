import { isIdValid } from "../../../../infrastructure/api/utils/isIdValid";
import { ValidationError } from "../../../../infrastructure/api/errors/validationError";
import { HttpResponse } from "../../../../infrastructure/api/httpResponse";
import { HttpNotFoundError } from "../../../../infrastructure/api/errors/httpNotFoundError";
import { TransactionByIdGetter } from "../../application/TransactionByIdGetter";
import { TransactionCreator } from "../../application/transactionCreator";
import { TransactionRemover } from "../../application/transactionRemover";
import { TransactionUpdater } from "../../application/transactionUpdater";
import { Request, Response } from "express";

export class TransactionController {
	constructor(
		private readonly transactionByIdGetter: TransactionByIdGetter,
		private readonly transactionCreator: TransactionCreator,
		private readonly transactionUpdater: TransactionUpdater,
		private readonly transactionRemover: TransactionRemover
	) {}

	getTransaction = async (req: Request, res: Response) => {
		const { id } = req.params;
		const transaction = await this.transactionByIdGetter.execute(id);

		if (!transaction) {
			throw new HttpNotFoundError("Transaction", id);
		}

		const responseBody = HttpResponse.success(transaction);
		res.status(responseBody.statusCode).json(responseBody);
	};

	saveTransaction = async (req: Request, res: Response) => {
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
	};

	updateTransaction = async (req: Request, res: Response) => {
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
	};

	deleteTransaction = async (req: Request, res: Response) => {
		const { id } = req.params;

		if (!isIdValid(id)) {
			throw new ValidationError().addError("id", `El id ${id} is inválido`);
		}

		await this.transactionRemover.execute(id);

		const responseBody = HttpResponse.success();
		res.status(responseBody.statusCode).json(responseBody);
	};
}
