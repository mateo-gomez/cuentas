import { Balance } from "../domain/balance.entity";
import { TransactionRepository } from "../domain/Transaction.repository";

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
