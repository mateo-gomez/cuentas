import { TransactionType } from "../../../../domain/valueObjects/transactionType.valueObject";

export interface PreviewRow {
	rowId: string; // server-assigned, stable within session
	date: string;
	description: string;
	value: number;
	type: TransactionType;
	categoryName?: string;
	possibleDuplicate: boolean; // dedup flag — advisory, set at parse
	rawLine?: string;
	warnings?: string[];
}

export interface ConfirmRow {
	rowId: string; // MUST exist in held preview
	date: string;
	description: string;
	value: number;
	type: TransactionType;
	categoryName: string; // resolved/created at confirm
	excluded?: boolean;
}

export interface ConfirmResult {
	persisted: number;
	excluded: number;
}
