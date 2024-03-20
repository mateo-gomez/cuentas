import type { RouterContext } from "../../../deps.ts";
import {
  GroupedTransactionByDayGetter,
} from "../../application/useCases/transaction/groupedTransactionByDayGetter.ts";
import { BalanceGetter } from "../../application/useCases/transaction/balanceGetter.ts";
import { GroupedTransactionByDayInRangeGetter } from "../../application/useCases/transaction/groupedTransactionByDayInRangeGetter.ts";
import { BalanceInRangeGetter } from "../../application/useCases/transaction/balanceInRangeGetter.ts";
import { TransactionAggregate } from "../../domain/aggregates/transaction.aggregate.ts";
import { Balance } from "../../domain/entities/balance.entity.ts";
import { HttpResponse } from "../httpResponse.ts";

export class TransactionAggregateController {
  constructor(
    private readonly groupedTransactionByDayGetter:
      GroupedTransactionByDayGetter,
    private readonly groupedTransactionByDayInRangeGetter:
      GroupedTransactionByDayInRangeGetter,
    private readonly balanceInRangeGetter: BalanceInRangeGetter,
    private readonly balanceGetter: BalanceGetter,
  ) {
  }

  getAllTransactions = async ({
    response,
    request,
  }: RouterContext<string>) => {
    const { searchParams } = request.url;
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    let transactionAggregates!: TransactionAggregate[];
    let balance!: Balance;

    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);

      transactionAggregates = await this.groupedTransactionByDayInRangeGetter
        .execute(startDate, endDate);
      balance = await this.balanceInRangeGetter.execute(startDate, endDate);
    } else {
      transactionAggregates = await this.groupedTransactionByDayGetter
        .execute();
      balance = await this.balanceGetter.execute();
    }

    const responseBody = HttpResponse.success({
      transactions: transactionAggregates,
      balance,
    });
    response.status = responseBody.statusCode;
    response.body = responseBody;
  };
}
