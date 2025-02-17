import { TransactionRepository } from "../domain/Transaction.repository";
import { DatabaseError } from "../../../infrastructure/api/errors/databaseError";
import { ApplicationError } from "../../../application/errors/applicationError";
import { NotFoundError } from "../../../application/errors/notFoundError";

export class TransactionRemover {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  execute = async (id: string): Promise<void> => {
    const exists = await this.transactionRepository.exists(id);

    if (!exists) {
      throw new NotFoundError(`Categoría no encontrada`, id);
    }

    try {
      await this.transactionRepository.delete(id);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new ApplicationError(error.message, error);
      }

      throw new ApplicationError("Error al eliminar categoría", error);
    }
  };
}
