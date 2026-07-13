import { Response } from "express";
import { isIdValid } from "../../../../infrastructure/api/utils/isIdValid";
import { ValidationError } from "../../../../infrastructure/api/errors/validationError";
import { HttpResponse } from "../../../../infrastructure/api/httpResponse";
import { RequestAuthenticated } from "../../../../infrastructure/api/middlewares/BaseMiddleware";
import { catchAsync } from "../../../../application/utils/catchAsync";
import { AccountByIdGetter } from "../../application/accountByIdGetter";
import { AccountCreator } from "../../application/accountCreator";
import { AccountGetter } from "../../application/accountGetter";
import { AccountRemover } from "../../application/accountRemover";
import { AccountUpdater } from "../../application/accountUpdater";
import { AccountBalanceGetter } from "../../application/accountBalanceGetter";
import { AccountDefaultGetter } from "../../application/accountDefaultGetter";

export class AccountController {
  constructor(
    private readonly accountByIdGetter: AccountByIdGetter,
    private readonly accountGetter: AccountGetter,
    private readonly accountCreator: AccountCreator,
    private readonly accountUpdater: AccountUpdater,
    private readonly accountRemover: AccountRemover,
    private readonly accountBalanceGetter: AccountBalanceGetter,
    private readonly accountDefaultGetter: AccountDefaultGetter,
  ) {}

  getDefaultAccount = catchAsync(async (request: RequestAuthenticated, response: Response) => {
    const userId = request.user!.id;

    const account = await this.accountDefaultGetter.execute(userId);

    const responseBody = HttpResponse.success(account);
    response.status(responseBody.statusCode).json(responseBody);
  });

  getAccounts = catchAsync(async (request: RequestAuthenticated, response: Response) => {
    const userId = request.user!.id;

    const accounts = await this.accountGetter.execute(userId);

    const responseBody = HttpResponse.success(accounts);
    response.status(responseBody.statusCode).json(responseBody);
  });

  getAccount = catchAsync(async (request: RequestAuthenticated, response: Response) => {
    const userId = request.user!.id;
    const { id } = request.params;

    if (!isIdValid(id)) {
      throw new ValidationError().addError("id", `El id ${id} is inválido`);
    }

    const account = await this.accountByIdGetter.execute(userId, id);

    if (!account) {
      throw new ValidationError().addError("id", "Cuenta no encontrada");
    }

    const responseBody = HttpResponse.success(account);
    response.status(responseBody.statusCode).json(responseBody);
  });

  getAccountBalance = catchAsync(async (request: RequestAuthenticated, response: Response) => {
    const userId = request.user!.id;
    const { id } = request.params;

    if (!isIdValid(id)) {
      throw new ValidationError().addError("id", `El id ${id} is inválido`);
    }

    const balance = await this.accountBalanceGetter.execute(userId, id);

    if (!balance) {
      throw new ValidationError().addError("id", "Cuenta no encontrada");
    }

    const responseBody = HttpResponse.success(balance);
    response.status(responseBody.statusCode).json(responseBody);
  });

  saveAccount = catchAsync(async (request: RequestAuthenticated, response: Response) => {
    const userId = request.user!.id;
    const { name, type, openingBalance, cutoffDay, dueDay } = request.body;

    const account = await this.accountCreator.execute(userId, {
      name,
      type,
      openingBalance: openingBalance ?? 0,
      cutoffDay,
      dueDay,
    });

    const responseBody = HttpResponse.success(account);
    response.status(responseBody.statusCode).json(responseBody);
  });

  updateAccount = catchAsync(async (request: RequestAuthenticated, response: Response) => {
    const userId = request.user!.id;
    const { id } = request.params;
    const { name, type, openingBalance, cutoffDay, dueDay } = request.body;

    if (!isIdValid(id)) {
      throw new ValidationError().addError("id", `El id ${id} is inválido`);
    }

    const account = await this.accountUpdater.execute(userId, id, {
      name,
      type,
      openingBalance,
      cutoffDay,
      dueDay,
    });

    const responseBody = HttpResponse.success(account);
    response.status(responseBody.statusCode).json(responseBody);
  });

  deleteAccount = catchAsync(async (request: RequestAuthenticated, response: Response) => {
    const userId = request.user!.id;
    const { id } = request.params;

    if (!isIdValid(id)) {
      throw new ValidationError().addError("id", `El id ${id} is inválido`);
    }

    await this.accountRemover.execute(userId, id);

    const responseBody = HttpResponse.success();
    response.status(responseBody.statusCode).json(responseBody);
  });
}
