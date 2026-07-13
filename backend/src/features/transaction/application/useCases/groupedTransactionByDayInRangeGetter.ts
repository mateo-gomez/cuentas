import { TransactionAggregate } from "../../domain/transaction.aggregate";
import { TransactionRepository } from "../../domain/Transaction.repository";
import { TransactionAggregateService } from "../services/TransactionAggregateService";

export class GroupedTransactionByDayInRangeGetter {
	constructor(
		private readonly transactionRepository: TransactionRepository,
		private readonly transactionAggregateService: TransactionAggregateService
	) {}

	execute = async (
		userId: string,
		startDate: Date,
		endDate: Date,
		accountId?: string
	): Promise<TransactionAggregate[]> => {
		const transactions = await this.transactionRepository.getBetweenDates(
			userId,
			startDate,
			endDate,
			accountId
		);
		const transactionAggregates =
			this.transactionAggregateService.execute(transactions);

		return transactionAggregates;
	};
}
