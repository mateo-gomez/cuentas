import { TransactionAggregate } from "../domain/transaction.aggregate";
import { TransactionRepository } from "../domain/Transaction.repository";
import { TransactionAggregateService } from "./TransactionAggregateService";

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
