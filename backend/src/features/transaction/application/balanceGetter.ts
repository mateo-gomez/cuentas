import { Balance } from "../domain/balance.entity.ts";
import { TransactionRepository } from "../domain/Transaction.repository.ts";

export class BalanceGetter {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  execute = async (): Promise<Balance> => {
    const { balance, incomes, expenses } = await this.transactionRepository
      .sumAll();

    return {
      incomes,
      expenses,
      balance,
    };
  };
}
