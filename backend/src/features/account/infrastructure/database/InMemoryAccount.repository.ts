import { Types } from "mongoose";
import { Account } from "../../domain/account.entity";
import {
  AccountCreationData,
  AccountRepository,
  AccountUpdateData,
} from "../../domain/account.repository";
import { DEFAULT_ACCOUNT_NAME } from "../../domain/defaultAccount";
import { DuplicateError } from "../../../../infrastructure/api/errors/duplicateError";

export class InMemoryAccountRepository implements AccountRepository {
  private accounts: Account[] = [];

  existsForUser = (userId: string, id: string): Promise<boolean> => {
    return Promise.resolve(
      this.accounts.some((a) => a._id === id && a.userId === userId),
    );
  };

  getByIdForUser = (userId: string, id: string): Promise<Account | null> => {
    return Promise.resolve(
      this.accounts.find((a) => a._id === id && a.userId === userId) ?? null,
    );
  };

  getByNameForUser = (userId: string, name: string): Promise<Account | null> => {
    return Promise.resolve(
      this.accounts.find((a) => a.userId === userId && a.name === name) ?? null,
    );
  };

  getAllForUser = (userId: string): Promise<Account[]> => {
    return Promise.resolve(this.accounts.filter((a) => a.userId === userId));
  };

  create = (userId: string, data: AccountCreationData): Promise<Account> => {
    if (this.accounts.some((a) => a.userId === userId && a.name === data.name)) {
      return Promise.reject(new DuplicateError(`La cuenta "${data.name}" ya existe`));
    }

    const account: Account = {
      // Real ObjectId-shaped ids so `isIdValid` (mongoose.Types.ObjectId.isValid)
      // accepts them wherever this fake is used to exercise controller-level
      // validation in tests.
      _id: new Types.ObjectId().toString(),
      userId,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.accounts.push(account);

    return Promise.resolve(account);
  };

  update = (
    userId: string,
    id: string,
    data: AccountUpdateData,
  ): Promise<Account | null> => {
    const idx = this.accounts.findIndex((a) => a._id === id && a.userId === userId);

    if (idx === -1) {
      return Promise.resolve(null);
    }

    this.accounts[idx] = {
      ...this.accounts[idx],
      ...data,
      updatedAt: new Date(),
    };

    return Promise.resolve(this.accounts[idx]);
  };

  delete = (userId: string, id: string): Promise<void> => {
    this.accounts = this.accounts.filter(
      (a) => !(a._id === id && a.userId === userId),
    );

    return Promise.resolve();
  };

  getDefaultForUser = (userId: string): Promise<Account | null> => {
    return this.getByNameForUser(userId, DEFAULT_ACCOUNT_NAME);
  };
}
