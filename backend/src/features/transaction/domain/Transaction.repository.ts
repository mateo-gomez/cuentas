import { Balance } from "./balance.entity.ts";
import { Transaction } from "./transaction.entity.ts";

export interface TransactionRepository {
  exists: (id: string) => Promise<boolean>;

  findOne: (id: string) => Promise<Transaction | null>;

  getAll: () => Promise<Transaction[]>;

  getBetweenDates: (startDate: Date, endDate: Date) => Promise<Transaction[]>;

  sumAll: () => Promise<Balance>;

  sumBetweenDates: (startDate: Date, endDate: Date) => Promise<Balance>;

  createTransaction: (
    newTransaction: Omit<Transaction, "_id" | "createdAt" | "updatedAt">,
  ) => Promise<Transaction>;

  updateTransaction: (
    id: string,
    newTransaction: Omit<Transaction, "_id" | "createdAt" | "updatedAt">,
  ) => Promise<Transaction | null>;

  delete: (id: string) => Promise<void>;
}
