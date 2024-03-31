import { isIdValid } from "../../../../infrastructure/api/utils/isIdValid.ts";
import { ValidationError } from "../../../../infrastructure/api/errors/validationError.ts";
import { HttpResponse } from "../../../../infrastructure/api/httpResponse.ts";
import { HttpNotFoundError } from "../../../../infrastructure/api/errors/httpNotFoundError.ts";
import { RouterContext } from "../../../../../deps.ts";
import { TransactionByIdGetter } from "../../application/TransactionByIdGetter.ts";
import { TransactionCreator } from "../../application/transactionCreator.ts";
import { TransactionRemover } from "../../application/transactionRemover.ts";
import { TransactionUpdater } from "../../application/transactionUpdater.ts";

export class TransactionController {
  constructor(
    private readonly transactionByIdGetter: TransactionByIdGetter,
    private readonly transactionCreator: TransactionCreator,
    private readonly transactionUpdater: TransactionUpdater,
    private readonly transactionRemover: TransactionRemover,
  ) {
  }

  getTransaction = async ({
    response,
    params,
  }: RouterContext<string>) => {
    const { id } = params;
    const transaction = await this.transactionByIdGetter.execute(id);

    if (!transaction) {
      throw new HttpNotFoundError("Transaction", id);
    }

    const responseBody = HttpResponse.success(transaction);
    response.status = responseBody.statusCode;
    response.body = responseBody;
  };

  saveTransaction = async ({
    response,
    request,
  }: RouterContext<string>) => {
    const body = await request.body({ type: "json" }).value;

    const transaction = await this.transactionCreator.execute({
      category: body.category,
      date: body.date,
      description: body.description,
      type: body.type,
      account: "",
      value: body.value,
    });

    const responseBody = HttpResponse.success(transaction);
    response.status = responseBody.statusCode;
    response.body = responseBody;
  };

  updateTransaction = async ({
    response,
    request,
    params,
  }: RouterContext<string>) => {
    const { id } = params;
    const body = await request.body({ type: "json" }).value;

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
    response.status = responseBody.statusCode;
    response.body = responseBody;
  };

  deleteTransaction = async (
    { response, params }: RouterContext<string>,
  ) => {
    const { id } = params;

    if (!isIdValid(id)) {
      throw new ValidationError().addError("id", `El id ${id} is inválido`);
    }

    await this.transactionRemover.execute(id);

    const responseBody = HttpResponse.success();
    response.status = responseBody.statusCode;
    response.body = responseBody;
  };
}
