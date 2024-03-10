import { TransactionAggregate } from "../../../domain/aggregates/transaction.aggregate.ts";
import {
  TransactionRepository,
} from "../../../domain/repositories/Transaction.repository.ts";
import { groupTransactions } from "../../services/groupTransactions.ts";

export class GroupedTransactionByDayGetter {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  execute = async (): Promise<TransactionAggregate[]> => {
    const transactions = await this.transactionRepository.getAll();
    const transactionAggregates = groupTransactions(transactions);

    return transactionAggregates;
  };
}
