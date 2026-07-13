import { TransactionDTO } from "../dto/transactionDTO";

export interface ExcelStreamParser {
	parse(
		filePath: string,
		onBatch: (batch: TransactionDTO[]) => Promise<void>,
		userId: string,
		accountId: string,
		batchSize?: number
	): Promise<void>;
}
