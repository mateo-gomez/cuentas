import {
	TransactionAggregate,
	TransactionRepository,
	GroupBy,
} from "../Transaction.repository.ts";
import Transaction from "../../models/Transaction.ts";

export class MongoTransactionRepository implements TransactionRepository {
	getGroupedBy = async (groupBy: GroupBy): Promise<TransactionAggregate[]> => {
		return await Transaction.groupDateBy(groupBy);
	};

	getAllByDay = async (): Promise<TransactionAggregate[]> => {
		return await Transaction.groupDateBy("day");
	};

	getInYearBy = async (
		groupBy: GroupBy,
		year: string
	): Promise<TransactionAggregate[]> => {
		return await Transaction.groupDateByMatchYear(groupBy, year);
	};

	getInMonthBy = async (
		groupBy: GroupBy,
		year: string,
		month: string
	): Promise<TransactionAggregate[]> => {
		return await Transaction.groupDateByMatchMonth(groupBy, year, month);
	};
}
