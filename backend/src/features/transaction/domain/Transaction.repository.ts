import { TransactionDTO } from "../application/dto/transactionDTO";
import { Balance } from "./balance.entity";
import { Transaction } from "./transaction.entity";

export type DedupTransaction = Pick<
  Transaction,
  "date" | "value" | "type" | "description"
>;

export interface TransactionRepository {
  exists: (userId: string, id: string) => Promise<boolean>;

  findOne: (userId: string, id: string) => Promise<Transaction | null>;

  getAll: (userId: string, accountId?: string) => Promise<Transaction[]>;

  getBetweenDates: (
    userId: string,
    startDate: Date,
    endDate: Date,
    accountId?: string,
  ) => Promise<Transaction[]>;

  sumAll: (userId: string, accountId?: string) => Promise<Balance>;

  sumBetweenDates: (
    userId: string,
    startDate: Date,
    endDate: Date,
    accountId?: string,
  ) => Promise<Balance>;

  createTransaction: (
    newTransaction: Omit<Transaction, "_id" | "createdAt" | "updatedAt">,
  ) => Promise<Transaction>;

  updateTransaction: (
    userId: string,
    id: string,
    newTransaction: Omit<Transaction, "_id" | "createdAt" | "updatedAt">,
  ) => Promise<Transaction | null>;

  delete: (userId: string, id: string) => Promise<void>;

  deleteMany: (userId: string, ids: string[]) => Promise<number>;

  firstDateRecord: (userId: string) => Promise<{ firstDate: Date } | null>;

  saveMany: (transactions: TransactionDTO[]) => Promise<void>;

  findForDedup: (
    userId: string,
    from: Date,
    to: Date,
  ) => Promise<DedupTransaction[]>;

  /** Used by the account delete guard — true if any transaction still references this accountId. */
  existsForAccount: (accountId: string) => Promise<boolean>;

  /** True if any transaction has no `accountId` (pre-migration legacy data, matches `account:""` and missing `account`). */
  hasOwnerlessTransactions: () => Promise<boolean>;

  /** One-time backfill: assigns `userId` + `accountId` to every ownerless transaction. Idempotent — matches nothing after the first run. */
  migrateOwnerlessTransactions: (
    userId: string,
    defaultAccountId: string,
  ) => Promise<number>;
}
