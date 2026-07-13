import { AccountRepository } from "../domain/account.repository";
import { TransactionRepository } from "../../transaction/domain/Transaction.repository";

export interface AccountBalance {
  accountId: string;
  openingBalance: number;
  incomes: number;
  expenses: number;
  movementsBalance: number;
  balance: number;
}

export class AccountBalanceGetter {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  execute = async (
    userId: string,
    accountId: string,
  ): Promise<AccountBalance | null> => {
    const account = await this.accountRepository.getByIdForUser(
      userId,
      accountId,
    );

    if (!account) {
      return null;
    }

    const movements = await this.transactionRepository.sumAll(
      userId,
      accountId,
    );

    return {
      accountId,
      openingBalance: account.openingBalance,
      incomes: movements.incomes,
      expenses: movements.expenses,
      movementsBalance: movements.balance,
      balance: account.openingBalance + movements.balance,
    };
  };
}
