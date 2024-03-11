import { Transaction } from "../../../domain/entities/transaction.entity.ts";
import { TransactionRepository } from "../../../domain/repositories/Transaction.repository.ts";

export class TransactionCreator {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  execute = (
    newTransaction: Omit<Transaction, "_id" | "createdAt" | "updatedAt">,
  ): Promise<Transaction> => {
    return this.transactionRepository.createTransaction(newTransaction);
  };
}
