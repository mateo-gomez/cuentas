import { Balance } from "./balance.entity";
import { Transaction } from "./transaction.entity";

export interface TransactionAggregate {
  _id: string;
  transactions: Transaction[];
  minDate: Date;
  maxDate: Date;
  balance: Balance;
}
