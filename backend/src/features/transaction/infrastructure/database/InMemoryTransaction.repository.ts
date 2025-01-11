import { Balance } from "../../domain/balance.entity";
import { Transaction } from "../../domain/transaction.entity";
import { TransactionRepository } from "../../domain/Transaction.repository";
import { TransactionType } from "../../../../domain/valueObjects/transactionType.valueObject";

export class InMemoryTransactionRepository implements TransactionRepository {
  private transactions: Transaction[];

  constructor() {
    this.transactions = [];
  }

  exists(id: string): Promise<boolean> {
    return Promise.resolve(
      this.transactions.some((transaction) => transaction._id === id),
    );
  }

  findOne(id: string): Promise<Transaction | null> {
    return Promise.resolve(
      this.transactions.find((transaction) => transaction._id === id) || null,
    );
  }

  getAll(): Promise<Transaction[]> {
    return Promise.resolve(this.transactions);
  }

  getBetweenDates(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return Promise.resolve(
      this.transactions.filter((transaction) =>
        transaction.date >= startDate && transaction.date <= endDate
      ),
    );
  }

  sumAll(): Promise<Balance> {
    const incomes = this.transactions.reduce((acc, transaction) => {
      return transaction.type === TransactionType.income
        ? acc + transaction.value
        : acc;
    }, 0);
    const expenses = this.transactions.reduce((acc, transaction) => {
      return transaction.type === TransactionType.expenses
        ? acc + transaction.value
        : acc;
    }, 0);
    const balance = incomes - expenses;
    return Promise.resolve({ incomes, expenses, balance });
  }

  async sumBetweenDates(startDate: Date, endDate: Date): Promise<Balance> {
    const filteredTransactions = await this.getBetweenDates(startDate, endDate);
    const incomes = filteredTransactions.reduce((acc, transaction) => {
      return transaction.type === TransactionType.income
        ? acc + transaction.value
        : acc;
    }, 0);
    const expenses = filteredTransactions.reduce((acc, transaction) => {
      return transaction.type === TransactionType.expenses
        ? acc + transaction.value
        : acc;
    }, 0);
    const balance = incomes - expenses;
    return { incomes, expenses, balance };
  }

  createTransaction(
    newTransaction: Omit<Transaction, "_id" | "createdAt" | "updatedAt">,
  ): Promise<Transaction> {
    const transaction: Transaction = {
      ...newTransaction,
      _id: Math.random().toString(36).substr(2, 9), // Simplemente para generar un ID único en memoria
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.transactions.push(transaction);
    return Promise.resolve(transaction);
  }

  async updateTransaction(
    id: string,
    newTransaction: Omit<Transaction, "_id" | "createdAt" | "updatedAt">,
  ): Promise<Transaction | null> {
    const index = await Promise.resolve(
      this.transactions.findIndex((transaction) => transaction._id === id),
    );
    if (index === -1) {
      return null;
    }
    const updatedTransaction: Transaction = {
      ...newTransaction,
      _id: id,
      createdAt: this.transactions[index].createdAt,
      updatedAt: new Date(),
    };
    this.transactions[index] = updatedTransaction;
    return updatedTransaction;
  }

  async delete(id: string): Promise<void> {
    this.transactions = await Promise.resolve(
      this.transactions.filter((transaction) => transaction._id !== id),
    );
  }

  firstDateRecord(): Promise<{ firstDate: Date } | null> {
    if (!this.transactions || this.transactions.length === 0) {
      return Promise.resolve(null); // No hay registros, devuelve null
    } else {
      let oldestDate: Date = this.transactions[0].date;
      for (let i = 1; i < this.transactions.length; i++) {
        if (this.transactions[i].date < oldestDate) {
          oldestDate = this.transactions[i].date;
        }
      }
      return Promise.resolve({ firstDate: oldestDate });
    }
  }
}
