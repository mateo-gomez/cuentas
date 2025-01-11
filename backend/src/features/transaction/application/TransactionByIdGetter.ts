import { Transaction } from "../domain/transaction.entity";
import { TransactionRepository } from "../domain/Transaction.repository";

export class TransactionByIdGetter {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  execute = (id: string): Promise<Transaction | null> => {
    return this.transactionRepository.findOne(id);
  };
}
