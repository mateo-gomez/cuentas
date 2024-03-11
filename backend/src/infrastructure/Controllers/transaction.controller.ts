import Transaction from "../models/Transaction.ts";
import { Status } from "../../../deps.ts";
import type { RouterContext } from "../../../deps.ts";
import { TransactionFinder } from "../../application/useCases/transaction/transactionFinder.ts";
import { TransactionUpdater } from "../../application/useCases/transaction/transactionUpdater.ts";

export class TransactionController {
  constructor(
    private readonly transactionFinder: TransactionFinder,
    private readonly transactionUpdater: TransactionUpdater,
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

    try {
      const transaction = await this.transactionUpdater.execute(id, {
        category: body.category,
        date: body.date,
        description: body.description,
        type: body.type,
        account: body.account,
        value: body.value,
      });

      response.status = Status.OK;
      response.body = transaction;
    } catch (error) {
      response.status = Status.NotFound;
      response.body = { message: "Error 404: Recurso no encontrado" };
      throw error;
    }
  };
}
