import { TransactionType } from "../../../../domain/valueObjects/transactionType.valueObject";
import { Reconciliation } from "../../domain/pdfImport/ParsedStatement";

export type { Reconciliation };

export interface PreviewRow {
	rowId: string; // server-assigned, stable within session
	date: string;
	description: string;
	value: number;
	type: TransactionType;
	categoryName?: string;
	possibleDuplicate: boolean; // dedup flag — advisory, set at parse
	// Advisory: the description looks like a credit-card payment. The client
	// offers to import it as a transfer (to a credit account) so the expense
	// isn't double-counted. Never forced — the user confirms/corrects.
	suggestedTransfer?: boolean;
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
	// When true, this row is imported as a transfer to `transferToAccountId`
	// (typically a credit card) instead of a plain expense.
	isTransfer?: boolean;
	transferToAccountId?: string;
}

export interface ConfirmResult {
	persisted: number;
	excluded: number;
}
