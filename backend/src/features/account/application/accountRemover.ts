import { AccountRepository } from "../domain/account.repository";
import { DEFAULT_ACCOUNT_NAME } from "../domain/defaultAccount";
import { TransactionRepository } from "../../transaction/domain/Transaction.repository";
import { ApplicationError } from "../../../application/errors/applicationError";
import { NotFoundError } from "../../../application/errors/notFoundError";
import { DatabaseError } from "../../../infrastructure/api/errors/databaseError";
import { ValidationError } from "../../../infrastructure/api/errors/validationError";

export class AccountRemover {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  execute = async (userId: string, id: string): Promise<void> => {
    const account = await this.accountRepository.getByIdForUser(userId, id);

    if (!account) {
      throw new NotFoundError("Cuenta no encontrada", id);
    }

    if (account.name === DEFAULT_ACCOUNT_NAME) {
      throw new ValidationError().addError(
        "id",
        `No se puede eliminar la cuenta "${DEFAULT_ACCOUNT_NAME}"`,
      );
    }

    const hasTransactions = await this.transactionRepository.existsForAccount(id);

    if (hasTransactions) {
      throw new ValidationError().addError(
        "id",
        "No se puede eliminar una cuenta con transacciones asociadas",
      );
    }

    try {
      await this.accountRepository.delete(userId, id);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new ApplicationError(error.message, error);
      }

      throw new ApplicationError("Error al eliminar cuenta", error);
    }
  };
}
