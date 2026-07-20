import { Balance } from "../../domain/balance.entity";
import { TransactionRepository } from "../../domain/Transaction.repository";

export class BalanceInRangeGetter {
	constructor(private readonly transactionRepository: TransactionRepository) {}

	execute = async (
		userId: string,
		startDate: Date,
		endDate: Date,
		accountId?: string
	): Promise<Balance> => {
		const { balance, expenses, incomes } =
			// Range totals for Home — exclude transfer legs (see BalanceGetter).
			await this.transactionRepository.sumBetweenDates(
				userId,
				startDate,
				endDate,
				accountId,
				true
			);

		return {
			incomes,
			expenses,
			balance,
		};
	};
}
