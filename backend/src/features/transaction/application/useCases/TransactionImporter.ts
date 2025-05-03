import { TransactionRepository } from "../../domain/Transaction.repository";
import { TransactionDTO } from "../dto/transactionDTO";

export class TransactionImporter {
	constructor(private readonly transactionRepository: TransactionRepository) {}

	execute = async (transactions: TransactionDTO[]): Promise<void> => {
		await this.transactionRepository.saveMany(transactions);
	};
}
