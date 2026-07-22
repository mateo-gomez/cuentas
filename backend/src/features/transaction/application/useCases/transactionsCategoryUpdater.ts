import { TransactionRepository } from "../../domain/Transaction.repository";
import { DatabaseError } from "../../../../infrastructure/api/errors/databaseError";
import { ApplicationError } from "../../../../application/errors/applicationError";

export class TransactionsCategoryUpdater {
	constructor(private readonly transactionRepository: TransactionRepository) {}

	execute = async (
		userId: string,
		ids: string[],
		categoryId: string,
	): Promise<number> => {
		const uniqueIds = [...new Set(ids)];

		try {
			return await this.transactionRepository.updateCategoryMany(
				userId,
				uniqueIds,
				categoryId,
			);
		} catch (error) {
			if (error instanceof DatabaseError) {
				throw new ApplicationError(error.message, error);
			}

			throw new ApplicationError(
				"Error al actualizar la categoría de las transacciones",
				error,
			);
		}
	};
}
