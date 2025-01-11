import { TransactionAggregate } from "../domain/transaction.aggregate";
import { TransactionRepository } from "../domain/Transaction.repository";
import { TransactionAggregateService } from "./TransactionAggregateService";

export class GroupedTransactionByDayInRangeGetter {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly transactionAggregateService: TransactionAggregateService,
  ) {}

  execute = async (
    startDate: Date,
    endDate: Date,
  ): Promise<TransactionAggregate[]> => {
    const transactions = await this.transactionRepository.getBetweenDates(
      startDate,
      endDate,
    );
    const transactionAggregates = this.transactionAggregateService.execute(
      transactions,
    );

    return transactionAggregates;
  };
}
