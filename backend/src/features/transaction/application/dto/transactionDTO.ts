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
}
