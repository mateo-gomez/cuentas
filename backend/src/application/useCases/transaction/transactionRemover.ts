import { TransactionRepository } from "../../../domain/repositories/Transaction.repository.ts";

export class TransactionRemover {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  execute = async (id: string): Promise<void> => {
    const exists = await this.transactionRepository.exists(id);

    if (!exists) {
      throw new Error(`Category ${id} no encontrada`);
    }

    await this.transactionRepository.delete(id);
  };
}
