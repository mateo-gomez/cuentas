import { Transaction } from "../entities/transaction.entity.ts";

export interface TransactionAggregate {
  _id: string;
  transactions: Transaction[];
  minDate: Date;
  maxDate: Date;
  balance: {
    incomes: number;
    expenses: number;
    balance: number;
  };
}
