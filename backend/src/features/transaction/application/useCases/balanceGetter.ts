import { Balance } from "../../domain/balance.entity";
import { TransactionRepository } from "../../domain/Transaction.repository";

export class BalanceGetter {
	constructor(private readonly transactionRepository: TransactionRepository) {}

	execute = async (userId: string, accountId?: string): Promise<Balance> => {
		// Global totals must not count transfer legs (account-to-account moves
		// such as credit-card payments) — otherwise the moved money inflates the
		// income/expense figures. Per-account balances (AccountBalanceGetter) keep
		// transfers so the move still shifts each account's balance.
		const { balance, incomes, expenses } =
			await this.transactionRepository.sumAll(userId, accountId, true);

		return {
			incomes,
			expenses,
			balance,
		};
	};
}
