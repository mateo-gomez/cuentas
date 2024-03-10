import Transaction from "../models/Transaction.ts";
import { Status } from "../../../deps.ts";
import type { RouterContext } from "../../../deps.ts";
import { TransactionFinder } from "../../application/useCases/transaction/transactionFinder.ts";

export class TransactionController {
  constructor(
    private readonly transactionFinder: TransactionFinder,
  ) {
  }

  getTransaction = async ({
    response,
    params,
  }: RouterContext<string>) => {
    const { id } = params;
    const transaction = await this.transactionFinder.execute(id);

    if (!transaction) {
      response.status = Status.NotFound;
    } else {
      response.status = Status.OK;
      response.body = transaction;
    }
  };

  saveTransaction = async ({
    response,
    request,
  }: RouterContext<string>) => {
    const body = await request.body({ type: "json" }).value;
    const transaction = await Transaction.create(body);

    response.status = Status.Created;
    response.body = transaction;
  };

  updateTransaction = async ({
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
}
