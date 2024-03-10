import { Balance } from "../../../domain/entities/balance.entity.ts";
import {
  TransactionRepository,
} from "../../../domain/repositories/Transaction.repository.ts";

export class BalanceInRangeGetter {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  execute = async (from: string, to: string): Promise<Balance> => {
    const dateFrom = new Date(from);
    const dateTo = new Date(to);

    const { balance, expenses, incomes } = await this.transactionRepository
      .sumBetweenDates(dateFrom, dateTo);

    return {
      incomes,
      expenses,
      balance,
    };
  };
}
