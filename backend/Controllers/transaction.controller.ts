import Transaction, { TransactionType } from "../models/Transaction.ts";

import { Status } from "../deps.ts";
import type { RouterContext } from "../deps.ts";

export const getTransactions = async ({ response }: RouterContext<string>) => {
	const transactions = await Transaction.find()
		.populate("category", ["_id", "name", "icon"])
		.sort({
			date: "desc",
		});

	let totalIncome = 0;
	let totalExpenses = 0;

	transactions.forEach((transaction) => {
		if (transaction.type === TransactionType.income) {
			totalIncome += transaction.value;
		}

		if (transaction.type === TransactionType.expenses) {
			totalExpenses += transaction.value;
		}
	});

	response.body = {
		transactions,
		totals: {
			income: totalIncome,
			expenses: totalExpenses,
			balance: totalIncome - totalExpenses,
		},
	};
};

export const getTransaction = async ({
	response,
	params,
}: RouterContext<string>) => {
	const { id } = params;

	const transaction = await Transaction.findById(id);

	response.status = Status.OK;
	response.body = transaction;
};

export const saveTransaction = async ({
	response,
	request,
}: RouterContext<string>) => {
	const body = await request.body({ type: "json" }).value;
	const transaction = await Transaction.create(body);

	response.status = Status.Created;
	response.body = transaction;
};

export const updateTransaction = async ({
	response,
	request,
	params,
}: RouterContext<string>) => {
	const { id } = params;
	const body = await request.body({ type: "json" }).value;
	const transaction = await Transaction.findById(id);

	if (!transaction) {
		response.status = Status.NotFound;
		response.body = { message: "Error 404: Recurso no encontrado" };
		return;
	}

	transaction.value = body.value || transaction.value;
	transaction.date = body.date || transaction.date;
	transaction.description = body.description || transaction.description;
	await transaction.save();

	response.status = Status.OK;
	response.body = transaction;
};
