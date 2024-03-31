import { TransactionAggregate } from "../../../domain/aggregates/transaction.aggregate.ts";
import { TransactionRepository } from "../../../domain/repositories/Transaction.repository.ts";
import { TransactionAggregateService } from "../../services/TransactionAggregateService.ts";

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
