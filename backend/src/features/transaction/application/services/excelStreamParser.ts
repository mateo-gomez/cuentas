import { TransactionDTO } from "../dto/transactionDTO";

export interface ExcelStreamParser {
	parse(
		filePath: string,
		onBatch: (batch: TransactionDTO[]) => Promise<void>,
		batchSize: number
	): Promise<void>;
}
