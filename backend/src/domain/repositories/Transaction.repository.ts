import { Balance } from "../entities/balance.entity.ts";
import { Transaction } from "../entities/transaction.entity.ts";

export interface TransactionRepository {
  findOne: (id: string) => Promise<Transaction | null>;
  getAll: () => Promise<Transaction[]>;
  getBetweenDates: (from: Date, to: Date) => Promise<Transaction[]>;
  sumAll: () => Promise<Balance>;
  sumBetweenDates: (from: Date, to: Date) => Promise<Balance>;
}
