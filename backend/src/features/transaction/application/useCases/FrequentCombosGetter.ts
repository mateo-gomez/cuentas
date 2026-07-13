import { TransactionRepository } from "../../domain/Transaction.repository";
import { FrequentComboDTO } from "../dto/frequentComboDTO";

const DEFAULT_LIMIT = 5;

export class FrequentCombosGetter {
	constructor(private readonly transactionRepository: TransactionRepository) {}

	execute = async (
		userId: string,
		accountId?: string,
		limit: number = DEFAULT_LIMIT
	): Promise<FrequentComboDTO[]> => {
		return this.transactionRepository.getFrequentCombos(userId, accountId, limit);
	};
}
