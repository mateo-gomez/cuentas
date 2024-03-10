import { TransactionAggregate } from "../../../domain/aggregates/transaction.aggregate.ts";
import {
  TransactionRepository,
} from "../../../domain/repositories/Transaction.repository.ts";
import { groupTransactions } from "../../services/groupTransactions.ts";

export class GroupedTransactionByDayInRangeGetter {
  constructor(
    private readonly transactionRepository: TransactionRepository,
  ) {}

  execute = async (
    from: string,
    to: string,
  ): Promise<TransactionAggregate[]> => {
    const transactions = await this.transactionRepository.getBetweenDates(
      new Date(from),
      new Date(to),
    );
    const transactionAggregates = groupTransactions(transactions);

    return transactionAggregates;
  };
}
