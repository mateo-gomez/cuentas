import { Balance } from "./balance.entity.ts";
import { Transaction } from "./transaction.entity.ts";

export interface TransactionAggregate {
  _id: string;
  transactions: Transaction[];
  minDate: Date;
  maxDate: Date;
  balance: Balance;
}
