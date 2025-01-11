import { TransactionType } from "../../../domain/valueObjects/transactionType.valueObject";
import { Category } from "../../category/domain/category.entity";

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
