import { Account } from "./account.entity";

export type AccountCreationData = Omit<
  Account,
  "_id" | "userId" | "createdAt" | "updatedAt"
>;

export type AccountUpdateData = Partial<AccountCreationData>;

export interface AccountRepository {
  existsForUser: (userId: string, id: string) => Promise<boolean>;

  getByIdForUser: (userId: string, id: string) => Promise<Account | null>;

  getByNameForUser: (userId: string, name: string) => Promise<Account | null>;

  getAllForUser: (userId: string) => Promise<Account[]>;

  create: (userId: string, data: AccountCreationData) => Promise<Account>;

  update: (
    userId: string,
    id: string,
    data: AccountUpdateData,
  ) => Promise<Account | null>;

  delete: (userId: string, id: string) => Promise<void>;

  getDefaultForUser: (userId: string) => Promise<Account | null>;
}
