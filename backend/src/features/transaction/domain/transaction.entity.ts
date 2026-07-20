import { TransactionType } from "../../../domain/valueObjects/transactionType.valueObject";
import { Category } from "../../category/domain/category.entity";

export interface Transaction {
  _id: string;
  userId: string;
  accountId: string;
  date: Date;
  value: number;
  /** @deprecated legacy free-text account label, superseded by `accountId` — kept until migration backfill removes it. */
  account?: string;
  category: Category;
  type: TransactionType;
  description: string;
  /**
   * True when this transaction is one leg of a transfer between two of the
   * user's own accounts (e.g. paying a credit card from a bank account).
   * Transfer legs still move each account's balance but are excluded from
   * global income/expense totals so the moved money is never counted as a
   * real gain or expense.
   */
  isTransfer?: boolean;
  /** Shared id linking the two legs of a transfer (source + destination). */
  transferId?: string;
  /** The other account involved in the transfer (the counterparty leg's account). */
  counterpartyAccountId?: string;
  createdAt: Date;
  updatedAt: Date;
}
