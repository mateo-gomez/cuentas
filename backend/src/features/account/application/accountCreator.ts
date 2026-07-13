import { Account } from "../domain/account.entity";
import { AccountCreationData, AccountRepository } from "../domain/account.repository";
import { assertAccountInvariants } from "./assertAccountInvariants";
import { ApplicationError } from "../../../application/errors/applicationError";
import { DuplicateError } from "../../../infrastructure/api/errors/duplicateError";
import { ValidationError } from "../../../infrastructure/api/errors/validationError";

export class AccountCreator {
  constructor(private readonly accountRepository: AccountRepository) {}

  execute = async (userId: string, data: AccountCreationData): Promise<Account> => {
    const validated = assertAccountInvariants(data);

    try {
      return await this.accountRepository.create(userId, validated);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }

      if (error instanceof DuplicateError) {
        throw new ApplicationError(`La cuenta "${data.name}" ya existe`, error);
      }

      throw new ApplicationError("Error creando cuenta", error);
    }
  };
}
