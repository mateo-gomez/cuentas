import { TransactionRepository } from "../../domain/Transaction.repository";
import { DatabaseError } from "../../../../infrastructure/api/errors/databaseError";
import { ApplicationError } from "../../../../application/errors/applicationError";

export class AllTransactionsRemover {
	constructor(private readonly transactionRepository: TransactionRepository) {}

	execute = async (userId: string): Promise<number> => {
		try {
			return await this.transactionRepository.deleteAllForUser(userId);
		} catch (error) {
			if (error instanceof DatabaseError) {
				throw new ApplicationError(error.message, error);
			}

			throw new ApplicationError("Error al eliminar transacciones", error);
		}
	};
}
