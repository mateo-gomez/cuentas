import { TransactionType } from "../../../../domain/valueObjects/transactionType.valueObject";

export interface FrequentComboDTO {
	description: string;
	// TransactionType enum: expenses = 0, income = 1 — passed through raw,
	// never inverted or remapped during aggregation.
	type: TransactionType;
	accountId: string;
	category: {
		_id: string;
		name: string;
		icon: string;
	};
	count: number;
}
