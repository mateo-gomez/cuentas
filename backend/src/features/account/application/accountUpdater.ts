import { Account } from "../domain/account.entity";
import { AccountRepository, AccountUpdateData } from "../domain/account.repository";
import { assertAccountInvariants } from "./assertAccountInvariants";
import { ApplicationError } from "../../../application/errors/applicationError";
import { NotFoundError } from "../../../application/errors/notFoundError";
import { DuplicateError } from "../../../infrastructure/api/errors/duplicateError";
import { ValidationError } from "../../../infrastructure/api/errors/validationError";

export class AccountUpdater {
  constructor(private readonly accountRepository: AccountRepository) {}

  execute = async (
    userId: string,
    id: string,
    data: AccountUpdateData,
  ): Promise<Account> => {
    const account = await this.accountRepository.getByIdForUser(userId, id);

    if (!account) {
      throw new NotFoundError("Cuenta no encontrada", id);
    }

    const merged = assertAccountInvariants({
      name: data.name ?? account.name,
      type: data.type ?? account.type,
      openingBalance: data.openingBalance ?? account.openingBalance,
      cutoffDay: data.cutoffDay ?? account.cutoffDay,
      dueDay: data.dueDay ?? account.dueDay,
    });

    let updated: Account | null;

    try {
      updated = await this.accountRepository.update(userId, id, merged);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }

      if (error instanceof DuplicateError) {
        throw new ApplicationError(`La cuenta "${merged.name}" ya existe`, error);
      }

      throw new ApplicationError("Error al guardar cuenta", error);
    }

    if (!updated) {
      throw new NotFoundError("Cuenta no encontrada", id);
    }

    return updated;
  };
}
