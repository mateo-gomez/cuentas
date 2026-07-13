import { Account } from "../domain/account.entity";
import { AccountRepository } from "../domain/account.repository";

export class AccountGetter {
  constructor(private readonly accountRepository: AccountRepository) {}

  execute = async (userId: string): Promise<Account[]> => {
    return await this.accountRepository.getAllForUser(userId);
  };
}
