import Transaction from "../models/Transaction.ts";

import { Status } from "../deps.ts";
import type { RouterContext } from "../deps.ts";
import { MongoTransactionRepository } from "../repositories/mongo/MongoTransaction.repository.ts";
import {
	GroupBy,
	TransactionAggregate,
} from "../repositories/Transaction.repository.ts";

const transactionRepository = new MongoTransactionRepository();

const getTransactionAggregateTotals = (
	transactionAggregates: TransactionAggregate[]
) =>
	transactionAggregates.reduce(
		(totals, transactionAggregate) => {
			totals.incomes += transactionAggregate.balance.incomes;
			totals.expenses += transactionAggregate.balance.expenses;
			totals.balance += transactionAggregate.balance.balance;

			return totals;
		},
		{
			incomes: 0,
			expenses: 0,
			balance: 0,
		}
	);

export const getAllTransactions = async ({
	response,
}: RouterContext<string>) => {
	const transactionAggregates = await transactionRepository.getGroupedBy("day");
	const totals = getTransactionAggregateTotals(transactionAggregates);

	response.body = {
		transactions: transactionAggregates,
		totals,
	};
};

export const getTransactionsBy = async ({
	response,
	params,
}: RouterContext<string>) => {
	const { year, month } = params;
	const groupBy = (params[0] || "year") as GroupBy;
	let transactionAggregates: TransactionAggregate[];

	if (groupBy === "year" && year) {
		transactionAggregates = await transactionRepository.getInYearBy(
			groupBy,
			year
		);
	} else if (groupBy === "month" && year && month) {
		transactionAggregates = await transactionRepository.getInMonthBy(
			groupBy,
			year,
			month
		);
	} else {
		transactionAggregates = await transactionRepository.getGroupedBy(groupBy);
	}

	const totals = getTransactionAggregateTotals(transactionAggregates);

	response.body = {
		transactions: transactionAggregates,
		totals,
	};
};

export const getTransaction = async ({
	response,
	params,
}: RouterContext<string>) => {
	const { id } = params;

	const transaction = await Transaction.findById(id).populate("category", [
		"_id",
		"name",
		"icon",
	]);

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
