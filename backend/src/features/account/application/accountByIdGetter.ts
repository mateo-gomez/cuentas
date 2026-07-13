import { Account } from "../domain/account.entity";
import { AccountRepository } from "../domain/account.repository";

export class AccountByIdGetter {
  constructor(private readonly accountRepository: AccountRepository) {}

  execute = async (userId: string, id: string): Promise<Account | null> => {
    return await this.accountRepository.getByIdForUser(userId, id);
  };
}
