import { TransactionAggregate } from "../../../domain/aggregates/transaction.aggregate.ts";
import { TransactionRepository } from "../../../domain/repositories/Transaction.repository.ts";
import { groupTransactions } from "../../services/groupTransactions.ts";

export class GroupedTransactionByDayInRangeGetter {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  execute = async (
    startDate: Date,
    endDate: Date,
  ): Promise<TransactionAggregate[]> => {
    const transactions = await this.transactionRepository.getBetweenDates(
      startDate,
      endDate,
    );
    const transactionAggregates = groupTransactions(transactions);

    return transactionAggregates;
  };
}
