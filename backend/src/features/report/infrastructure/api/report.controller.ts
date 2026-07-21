import { Response } from "express";
import { CategoryReportGetter } from "../../application/useCases/CategoryReportGetter";
import { CategoryTrendGetter } from "../../application/useCases/CategoryTrendGetter";
import { TransactionType } from "../../../../domain/valueObjects/transactionType.valueObject";
import { HttpResponse } from "../../../../infrastructure/api/httpResponse";
import { ValidationError } from "../../../../infrastructure/api/errors/validationError";
import { catchAsync } from "../../../../application/utils/catchAsync";
import { RequestAuthenticated } from "../../../../infrastructure/api/middlewares/BaseMiddleware";

export class ReportController {
  constructor(
    private readonly categoryReportGetter: CategoryReportGetter,
    private readonly categoryTrendGetter: CategoryTrendGetter,
  ) {}

  categoryReport = catchAsync(
    async (req: RequestAuthenticated, res: Response) => {
      const userId = req.user!.id;
      const { start, end, accountId, type } = req.query;

      const startDate = this.parseDate(start, "start");
      const endDate = this.parseDate(end, "end");
      if (startDate > endDate) {
        throw new ValidationError().addError(
          "range",
          "start debe ser anterior o igual a end.",
        );
      }

      const accountFilter =
        typeof accountId === "string" && accountId.length > 0
          ? accountId
          : undefined;

      const report = await this.categoryReportGetter.execute(
        userId,
        startDate,
        endDate,
        this.parseType(type),
        accountFilter,
      );

      const responseBody = HttpResponse.success(report);
      res.status(responseBody.statusCode).json(responseBody);
    },
  );

  categoryTrend = catchAsync(
    async (req: RequestAuthenticated, res: Response) => {
      const userId = req.user!.id;
      const { year, month, accountId, type } = req.query;

      const y = this.parseInt(year, "year", 1970, 9999);
      // month is 1-12 in the API; converted to a 0-based month index below.
      const m = this.parseInt(month, "month", 1, 12) - 1;

      const current = this.monthBounds(y, m);
      const previous = this.monthBounds(y, m - 1);

      const accountFilter =
        typeof accountId === "string" && accountId.length > 0
          ? accountId
          : undefined;

      const trend = await this.categoryTrendGetter.execute(
        userId,
        current.start,
        current.end,
        previous.start,
        previous.end,
        this.parseType(type),
        accountFilter,
      );

      const responseBody = HttpResponse.success(trend);
      res.status(responseBody.statusCode).json(responseBody);
    },
  );

  // First/last instant of a month. A negative or 12 monthIndex rolls the year
  // over via the Date constructor, so previous-month math needs no special case.
  private monthBounds = (year: number, monthIndex: number) => ({
    start: new Date(year, monthIndex, 1),
    end: new Date(year, monthIndex + 1, 0, 23, 59, 59, 999),
  });

  private parseInt = (
    value: unknown,
    field: string,
    min: number,
    max: number,
  ): number => {
    const n = typeof value === "string" ? Number(value) : NaN;
    if (!Number.isInteger(n) || n < min || n > max) {
      throw new ValidationError().addError(
        field,
        `${field} debe ser un entero entre ${min} y ${max}.`,
      );
    }
    return n;
  };

  private parseDate = (value: unknown, field: string): Date => {
    if (typeof value !== "string" || value.length === 0) {
      throw new ValidationError().addError(field, `${field} es obligatorio.`);
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new ValidationError().addError(
        field,
        `${field} no es una fecha válida.`,
      );
    }
    return date;
  };

  // Expenses is the default report — only an explicit "income" flips the side.
  private parseType = (value: unknown): TransactionType =>
    value === "income" ? TransactionType.income : TransactionType.expenses;
}
