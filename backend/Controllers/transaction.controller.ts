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

export const saveTransaction = async ({
	response,
	request,
}: RouterContext<string>) => {
	const body = await request.body({ type: "json" }).value;
	const transaction = await Transaction.create(body);

	response.status = Status.Created;
	response.body = transaction;
};
