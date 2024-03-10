import Transaction from "../models/Transaction.ts";

import { Status } from "../../../deps.ts";
import type { RouterContext } from "../../../deps.ts";
import { MongoTransactionRepository } from "../../infrastructure/implementations/mongo/MongoTransaction.repository.ts";
import {
  GroupedTransactionByDayGetter,
} from "../../application/useCases/transaction/groupedTransactionByDayGetter.ts";
import { BalanceGetter } from "../../application/useCases/transaction/balanceGetter.ts";
import { TransactionFinder } from "../../application/useCases/transaction/transactionFinder.ts";
import { GroupedTransactionByDayInRangeGetter } from "../../application/useCases/transaction/groupedTransactionByDayInRangeGetter.ts";
import { BalanceInRangeGetter } from "../../application/useCases/transaction/balanceInRangeGetter.ts";
import { TransactionAggregate } from "../../domain/aggregates/transaction.aggregate.ts";
import { Balance } from "../../domain/entities/balance.entity.ts";

const transactionRepository = new MongoTransactionRepository();

export const getAllTransactions = async ({
  response,
  request,
}: RouterContext<string>) => {
  const { searchParams } = request.url;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let transactionAggregates!: TransactionAggregate[];
  let balance!: Balance;

  if (from && to) {
    transactionAggregates = await (new GroupedTransactionByDayInRangeGetter(
      transactionRepository,
    )).execute(from, to);

    balance = await (new BalanceInRangeGetter(
      transactionRepository,
    )).execute(from, to);
  } else {
    transactionAggregates = await (new GroupedTransactionByDayGetter(
      transactionRepository,
    )).execute();

    balance = await (new BalanceGetter(
      transactionRepository,
    )).execute();
  }

  response.body = {
    transactions: transactionAggregates,
    balance,
  };
};

export const getTransaction = async ({
  response,
  params,
}: RouterContext<string>) => {
  const { id } = params;
  const transactionFinder = new TransactionFinder(transactionRepository);
  const transaction = await transactionFinder.execute(id);

  if (!transaction) {
    response.status = Status.NotFound;
  } else {
    response.status = Status.OK;
    response.body = transaction;
  }
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
