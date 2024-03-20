import { Transaction } from "../../../domain/entities/transaction.entity.ts";
import { TransactionRepository } from "../../../domain/repositories/Transaction.repository.ts";
import { ApplicationError } from "../../errors/applicationError.ts";
import { NotFoundError } from "../../errors/notFoundError.ts";

export class TransactionUpdater {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  execute = async (
    id: string,
    transactionData: Partial<Transaction>,
  ): Promise<Transaction> => {
    const transaction = await this.transactionRepository.findOne(id);

    if (!transaction) {
      throw new NotFoundError("Transacción no encontrada", id);
    }

    const transactionToUpdate = {
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
        id,
        transactionToUpdate,
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
