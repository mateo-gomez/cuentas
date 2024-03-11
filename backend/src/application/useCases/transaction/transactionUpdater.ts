import { Transaction } from "../../../domain/entities/transaction.entity.ts";
import { TransactionRepository } from "../../../domain/repositories/Transaction.repository.ts";

export class TransactionUpdater {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  execute = async (
    id: string,
    transactionData: Partial<Transaction>,
  ): Promise<Transaction> => {
    const transaction = await this.transactionRepository.findOne(id);

    if (!transaction) {
      throw new Error("Transacción no encontrada");
    }

    const transactionToUpdate = {
      account: transactionData.account ?? transaction.account,
      category: transactionData.category ?? transaction.category,
      date: transactionData.date ?? transaction.date,
      description: transactionData.description ?? transaction.description,
      value: transactionData.value ?? transaction.value,
      type: transactionData.type ?? transaction.type,
    };

    return this.transactionRepository.updateTransaction(
      id,
      transactionToUpdate,
    );
  };
}
