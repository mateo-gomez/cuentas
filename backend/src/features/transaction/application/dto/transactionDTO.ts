// application/dto/TransactionDTO.ts

import { TransactionType } from "../../../../domain/valueObjects/transactionType.valueObject";

export interface TransactionDTO {
	date: Date;
	description: string;
	value: number;
	category: string;
	type: TransactionType;
	// Both bulk-import paths (excel/PDF) now thread userId + accountId: PDF
	// import uses the single account chosen for the whole batch (R9), excel
	// import falls back to the user's default "Sin asignar" account (R6).
	userId: string;
	accountId: string;
	// Transfer metadata — set only for the two legs of an account-to-account
	// transfer. Absent on ordinary income/expense transactions.
	isTransfer?: boolean;
	transferId?: string;
	counterpartyAccountId?: string;
}
