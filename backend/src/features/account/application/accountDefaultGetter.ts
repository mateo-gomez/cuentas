import { Account } from "../domain/account.entity";
import { AccountRepository } from "../domain/account.repository";

export class AccountDefaultGetter {
  constructor(private readonly accountRepository: AccountRepository) {}

  execute = async (userId: string): Promise<Account | null> => {
    return await this.accountRepository.getDefaultForUser(userId);
  };
}
