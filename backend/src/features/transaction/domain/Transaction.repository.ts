import { TransactionDTO } from "../application/dto/transactionDTO";
import { FrequentComboDTO } from "../application/dto/frequentComboDTO";
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

  /**
   * @param excludeTransfers when true, transfer legs (`isTransfer`) are left
   *   out of the income/expense sums — used for global totals that must not
   *   count account-to-account moves. Per-account balances pass false so the
   *   move still shifts each account's balance.
   */
  sumAll: (
    userId: string,
    accountId?: string,
    excludeTransfers?: boolean,
  ) => Promise<Balance>;

  sumBetweenDates: (
    userId: string,
    startDate: Date,
    endDate: Date,
    accountId?: string,
    excludeTransfers?: boolean,
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

  /** Deletes both legs of a transfer at once. Returns the number of docs removed. */
  deleteByTransferId: (userId: string, transferId: string) => Promise<number>;

  deleteMany: (userId: string, ids: string[]) => Promise<number>;

  /** Assigns the same category to many transactions at once. Returns the number of docs updated. */
  updateCategoryMany: (
    userId: string,
    ids: string[],
    categoryId: string,
  ) => Promise<number>;

  /**
   * Deletes every transaction belonging to an account, including the partner
   * legs of any transfer those transactions take part in (so no dangling
   * `transferId` is left on other accounts). Returns the number of docs removed.
   */
  deleteByAccount: (userId: string, accountId: string) => Promise<number>;

  /** Deletes ALL transactions for a user. Used by the "start from scratch" reset. */
  deleteAllForUser: (userId: string) => Promise<number>;

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

  /**
   * Top-N most frequent (description, category, type) combos for a user,
   * optionally scoped to an accountId. Skips combos whose category has been
   * deleted. Used by smart defaults (Slice 2) and Home suggestion chips
   * (Slice 3).
   */
  getFrequentCombos: (
    userId: string,
    accountId?: string,
    limit?: number,
  ) => Promise<FrequentComboDTO[]>;
}
