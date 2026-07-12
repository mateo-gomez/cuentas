import { TransactionRepository } from "../../domain/Transaction.repository";
import { DatabaseError } from "../../../../infrastructure/api/errors/databaseError";
import { ApplicationError } from "../../../../application/errors/applicationError";

export class TransactionsRemover {
	constructor(private readonly transactionRepository: TransactionRepository) {}

	execute = async (ids: string[]): Promise<number> => {
		const uniqueIds = [...new Set(ids)];

		try {
			return await this.transactionRepository.deleteMany(uniqueIds);
		} catch (error) {
			if (error instanceof DatabaseError) {
				throw new ApplicationError(error.message, error);
			}

			throw new ApplicationError("Error al eliminar transacciones", error);
		}
	};
}
