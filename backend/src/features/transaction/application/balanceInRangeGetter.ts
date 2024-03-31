import { Balance } from "../domain/balance.entity.ts";
import { TransactionRepository } from "../domain/Transaction.repository.ts";

export class BalanceInRangeGetter {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  execute = async (startDate: Date, endDate: Date): Promise<Balance> => {
    const { balance, expenses, incomes } = await this.transactionRepository
      .sumBetweenDates(startDate, endDate);

    return {
      incomes,
      expenses,
      balance,
    };
  };
}
