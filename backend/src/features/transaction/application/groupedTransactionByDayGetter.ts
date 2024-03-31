import { TransactionAggregate } from "../domain/transaction.aggregate.ts";
import { TransactionRepository } from "../domain/Transaction.repository.ts";
import { TransactionAggregateService } from "./TransactionAggregateService.ts";

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
