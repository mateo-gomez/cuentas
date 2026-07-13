import { TransactionAggregate } from "../../domain/transaction.aggregate";
import { TransactionRepository } from "../../domain/Transaction.repository";
import { TransactionAggregateService } from "../services/TransactionAggregateService";

export class GroupedTransactionByDayGetter {
	constructor(
		private readonly transactionRepository: TransactionRepository,
		private readonly transactionAggregateService: TransactionAggregateService
	) {}

	execute = async (
		userId: string,
		accountId?: string
	): Promise<TransactionAggregate[]> => {
		const transactions = await this.transactionRepository.getAll(
			userId,
			accountId
		);
		const transactionAggregates =
			this.transactionAggregateService.execute(transactions);

		return transactionAggregates;
	};
}
