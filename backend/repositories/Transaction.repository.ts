import { Transaction } from "../models/Transaction.ts";

export type GroupBy = "year" | "month" | "day" | "week";

export interface TransactionAggregate {
	_id: string;
	transactions: Transaction[];
	minDate: Date;
	maxDate: Date;
	balance: {
		incomes: number;
		expenses: number;
		balance: number;
	};
}

export interface TransactionRepository {
	getAllByDay: () => Promise<TransactionAggregate[]>;

	getGroupedBy: (groupBy: GroupBy) => Promise<TransactionAggregate[]>;

	getInYearBy: (
		groupBy: GroupBy,
		year: string
	) => Promise<TransactionAggregate[]>;

	getInMonthBy: (
		groupBy: GroupBy,
		year: string,
		month: string
	) => Promise<TransactionAggregate[]>;
}
