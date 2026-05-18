import { Response } from "express";
import { catchAsync } from "../../../../application/utils/catchAsync";
import { HttpResponse } from "../../../../infrastructure/api/httpResponse";
import { RequestAuthenticated } from "../../../../infrastructure/api/middlewares/BaseMiddleware";
import { BudgetGetter } from "../../application/budgetGetter";
import { BudgetUpsert } from "../../application/budgetUpsert";

export class BudgetController {
  constructor(
    private readonly budgetGetter: BudgetGetter,
    private readonly budgetUpsert: BudgetUpsert,
  ) {}

  getBudget = catchAsync(async (request: RequestAuthenticated, response: Response) => {
    const userId = request.user!.id;
    const now = new Date();
    const year = Number(request.query.year ?? now.getFullYear());
    const month = Number(request.query.month ?? now.getMonth() + 1);

    const status = await this.budgetGetter.execute(userId, year, month);

    const body = HttpResponse.success(status);
    response.status(body.statusCode).json(body);
  });

  saveBudget = catchAsync(async (request: RequestAuthenticated, response: Response) => {
    const userId = request.user!.id;
    const { year, month, total, categories = [] } = request.body;

    const budget = await this.budgetUpsert.execute(userId, { year, month, total, categories });

    const body = HttpResponse.success(budget);
    response.status(body.statusCode).json(body);
  });
}
