import { TransactionType } from "../valueObjects/transactionType.valueObject.ts";
import { Category } from "./category.entity.ts";

export interface Transaction {
  _id: string;
  date: Date;
  value: number;
  account: string;
  category: Category;
  type: TransactionType;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
