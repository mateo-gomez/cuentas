import { AccountRepository } from "../domain/account.repository";
import { TransactionRepository } from "../../transaction/domain/Transaction.repository";
import { ApplicationError } from "../../../application/errors/applicationError";
import { NotFoundError } from "../../../application/errors/notFoundError";
import { DatabaseError } from "../../../infrastructure/api/errors/databaseError";

export class AccountEmptier {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  execute = async (userId: string, id: string): Promise<number> => {
    const account = await this.accountRepository.getByIdForUser(userId, id);

    if (!account) {
      throw new NotFoundError("Cuenta no encontrada", id);
    }

    try {
      // Wipes every transaction of the account (plus transfer partner legs)
      // but keeps the account itself so the user can start from zero.
      return await this.transactionRepository.deleteByAccount(userId, id);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new ApplicationError(error.message, error);
      }

      throw new ApplicationError("Error al vaciar cuenta", error);
    }
  };
}
