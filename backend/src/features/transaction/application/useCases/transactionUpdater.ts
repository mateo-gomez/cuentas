import { Transaction } from "../../domain/transaction.entity";
import { TransactionRepository } from "../../domain/Transaction.repository";
import { ApplicationError } from "../../../../application/errors/applicationError";
import { NotFoundError } from "../../../../application/errors/notFoundError";

export class TransactionUpdater {
	constructor(private readonly transactionRepository: TransactionRepository) {}

	execute = async (
		userId: string,
		id: string,
		transactionData: Partial<Transaction>
	): Promise<Transaction> => {
		const transaction = await this.transactionRepository.findOne(userId, id);

		if (!transaction) {
			throw new NotFoundError("Transacción no encontrada", id);
		}

		// Defense in depth: even though findOne is already userId-scoped,
		// explicitly reject cross-user updates instead of trusting the scope alone.
		if (transaction.userId !== userId) {
			throw new NotFoundError("Transacción no encontrada", id);
		}

		const transactionToUpdate = {
			// Never let the request body reassign ownership — always keep the
			// authenticated owner resolved by the userId-scoped findOne above.
			userId: transaction.userId,
			accountId: transactionData.accountId ?? transaction.accountId,
			account: transactionData.account ?? transaction.account,
			category: transactionData.category ?? transaction.category,
			date: transactionData.date ?? transaction.date,
			description: transactionData.description ?? transaction.description,
			value: transactionData.value ?? transaction.value,
			type: transactionData.type ?? transaction.type,
		};

		let transactionUpdated: Transaction | null;

		try {
			transactionUpdated = await this.transactionRepository.updateTransaction(
				userId,
				id,
				transactionToUpdate
			);
		} catch (error) {
			throw new ApplicationError("Error al guardar transacción", error);
		}

		if (!transactionUpdated) {
			throw new NotFoundError("Transaction no encontrada", id);
		}

		return transactionUpdated;
	};
}
