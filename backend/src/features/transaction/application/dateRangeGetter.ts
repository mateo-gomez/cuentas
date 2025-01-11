import { DateRange } from "../domain/dateRange.entity";
import { TransactionRepository } from "../domain/Transaction.repository";

export class DateRangeGetter {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  execute = async (): Promise<DateRange> => {
    const firstDate = await this.transactionRepository.firstDateRecord();
    const end = new Date();
    const start = firstDate?.firstDate || end;

    return {
      start,
      end,
    };
  };
}
