import { Status } from "../../../deps.ts";
import type { RouterContext } from "../../../deps.ts";
import {
  GroupedTransactionByDayGetter,
} from "../../application/useCases/transaction/groupedTransactionByDayGetter.ts";
import { BalanceGetter } from "../../application/useCases/transaction/balanceGetter.ts";
import { GroupedTransactionByDayInRangeGetter } from "../../application/useCases/transaction/groupedTransactionByDayInRangeGetter.ts";
import { BalanceInRangeGetter } from "../../application/useCases/transaction/balanceInRangeGetter.ts";
import { TransactionAggregate } from "../../domain/aggregates/transaction.aggregate.ts";
import { Balance } from "../../domain/entities/balance.entity.ts";

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
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let transactionAggregates!: TransactionAggregate[];
    let balance!: Balance;

    if (from && to) {
      transactionAggregates = await this.groupedTransactionByDayInRangeGetter
        .execute(from, to);
      balance = await this.balanceInRangeGetter.execute(from, to);
    } else {
      transactionAggregates = await this.groupedTransactionByDayGetter
        .execute();
      balance = await this.balanceGetter.execute();
    }

    response.status = Status.OK;
    response.body = {
      transactions: transactionAggregates,
      balance,
    };
  };
}
