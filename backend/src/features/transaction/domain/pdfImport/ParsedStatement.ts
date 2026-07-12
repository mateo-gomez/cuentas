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

export interface Reconciliation {
	available: boolean;
	reconciled: boolean;
	openingBalance: number | null;
	closingBalance: number | null;
	computedDelta: number | null;
	expectedDelta: number | null;
	difference: number | null;
}

export interface ParsedStatement {
	bankId: string;
	rows: RawParsedTransaction[];
	warnings: string[];
	reconciliation: Reconciliation;
}
