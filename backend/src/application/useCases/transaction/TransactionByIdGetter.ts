import { Transaction } from "../../../domain/entities/transaction.entity.ts";
import { TransactionRepository } from "../../../domain/repositories/Transaction.repository.ts";

export class TransactionByIdGetter {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  execute = (id: string): Promise<Transaction | null> => {
    return this.transactionRepository.findOne(id);
  };
}
