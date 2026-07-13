import { DateRange } from "../../domain/dateRange.entity";
import { TransactionRepository } from "../../domain/Transaction.repository";

export class DateRangeGetter {
	constructor(private readonly transactionRepository: TransactionRepository) {}

	execute = async (userId: string): Promise<DateRange> => {
		const firstDate = await this.transactionRepository.firstDateRecord(userId);
		const end = new Date();
		const start = firstDate?.firstDate || end;

		return {
			start,
			end,
		};
	};
}
