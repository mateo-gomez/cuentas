import { TransactionRepository } from "../../domain/Transaction.repository";
import { DatabaseError } from "../../../../infrastructure/api/errors/databaseError";
import { ApplicationError } from "../../../../application/errors/applicationError";
import { NotFoundError } from "../../../../application/errors/notFoundError";

export class TransactionRemover {
	constructor(private readonly transactionRepository: TransactionRepository) {}

	execute = async (userId: string, id: string): Promise<void> => {
		const transaction = await this.transactionRepository.findOne(userId, id);

		if (!transaction) {
			throw new NotFoundError(`Categoría no encontrada`, id);
		}

		try {
			// Deleting one leg of a transfer must remove both legs, otherwise the
			// counterparty account keeps a dangling half-transfer that skews its
			// balance.
			if (transaction.transferId) {
				await this.transactionRepository.deleteByTransferId(
					userId,
					transaction.transferId
				);
			} else {
				await this.transactionRepository.delete(userId, id);
			}
		} catch (error) {
			if (error instanceof DatabaseError) {
				throw new ApplicationError(error.message, error);
			}

			throw new ApplicationError("Error al eliminar categoría", error);
		}
	};
}
