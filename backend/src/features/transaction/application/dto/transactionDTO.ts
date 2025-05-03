// application/dto/TransactionDTO.ts

import { TransactionType } from "../../../../domain/valueObjects/transactionType.valueObject";

export interface TransactionDTO {
	date: Date;
	description: string;
	value: number;
	category: string;
	type: TransactionType;
}
