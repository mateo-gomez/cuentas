import { TransactionType } from "../../../../domain/valueObjects/transactionType.valueObject";

export interface RawParsedTransaction {
	date: string; // ISO yyyy-mm-dd (Python-emitted)
	description: string;
	value: number; // SIGNED, finite
	type: TransactionType; // trusted from Python
	categoryName?: string; // suggestion only; NOT resolved at parse
	rawLine?: string;
	warnings?: string[];
}

export interface ParsedStatement {
	bankId: string;
	rows: RawParsedTransaction[];
	warnings: string[];
}
