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
			await this.transactionRepository.sumBetweenDates(
				userId,
				startDate,
				endDate,
				accountId
			);

		return {
			incomes,
			expenses,
			balance,
		};
	};
}
