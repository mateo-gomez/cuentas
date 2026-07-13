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
  createdAt: Date;
  updatedAt: Date;
}
