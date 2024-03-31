import { TransactionAggregate } from "../../../domain/aggregates/transaction.aggregate.ts";
import {
  TransactionRepository,
} from "../../../domain/repositories/Transaction.repository.ts";
import { TransactionAggregateService } from "../../services/TransactionAggregateService.ts";

export class GroupedTransactionByDayGetter {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly transactionAggregateService: TransactionAggregateService,
  ) {}

  execute = async (): Promise<TransactionAggregate[]> => {
    const transactions = await this.transactionRepository.getAll();
    const transactionAggregates = this.transactionAggregateService.execute(
      transactions,
    );

    return transactionAggregates;
  };
}
