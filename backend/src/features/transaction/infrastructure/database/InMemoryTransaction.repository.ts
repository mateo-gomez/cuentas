import { Balance } from "../../domain/balance.entity";
import { Transaction } from "../../domain/transaction.entity";
import {
  DedupTransaction,
  TransactionRepository,
} from "../../domain/Transaction.repository";
import { TransactionType } from "../../../../domain/valueObjects/transactionType.valueObject";
import { TransactionDTO } from "../../application/dto/transactionDTO";
import { FrequentComboDTO } from "../../application/dto/frequentComboDTO";

export class InMemoryTransactionRepository implements TransactionRepository {
  private transactions: Transaction[];

  constructor() {
    this.transactions = [];
  }

  exists(userId: string, id: string): Promise<boolean> {
    return Promise.resolve(
      this.transactions.some(
        (transaction) => transaction._id === id && transaction.userId === userId,
      ),
    );
  }

  findOne(userId: string, id: string): Promise<Transaction | null> {
    return Promise.resolve(
      this.transactions.find(
        (transaction) => transaction._id === id && transaction.userId === userId,
      ) || null,
    );
  }

  getAll(userId: string, accountId?: string): Promise<Transaction[]> {
    return Promise.resolve(
      this.transactions.filter(
        (transaction) =>
          transaction.userId === userId &&
          (!accountId || transaction.accountId === accountId),
      ),
    );
  }

  getBetweenDates(
    userId: string,
    startDate: Date,
    endDate: Date,
    accountId?: string,
  ): Promise<Transaction[]> {
    return Promise.resolve(
      this.transactions.filter(
        (transaction) =>
          transaction.userId === userId &&
          transaction.date >= startDate &&
          transaction.date <= endDate &&
          (!accountId || transaction.accountId === accountId),
      ),
    );
  }

  async sumAll(
    userId: string,
    accountId?: string,
    excludeTransfers = false,
  ): Promise<Balance> {
    const all = await this.getAll(userId, accountId);
    const filteredTransactions = excludeTransfers
      ? all.filter((transaction) => !transaction.isTransfer)
      : all;
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

  async sumBetweenDates(
    userId: string,
    startDate: Date,
    endDate: Date,
    accountId?: string,
    excludeTransfers = false,
  ): Promise<Balance> {
    const inRange = await this.getBetweenDates(
      userId,
      startDate,
      endDate,
      accountId,
    );
    const filteredTransactions = excludeTransfers
      ? inRange.filter((transaction) => !transaction.isTransfer)
      : inRange;
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
    userId: string,
    id: string,
    newTransaction: Omit<Transaction, "_id" | "createdAt" | "updatedAt">,
  ): Promise<Transaction | null> {
    const index = await Promise.resolve(
      this.transactions.findIndex(
        (transaction) => transaction._id === id && transaction.userId === userId,
      ),
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

  async delete(userId: string, id: string): Promise<void> {
    this.transactions = await Promise.resolve(
      this.transactions.filter(
        (transaction) => !(transaction._id === id && transaction.userId === userId),
      ),
    );
  }

  async deleteByTransferId(
    userId: string,
    transferId: string,
  ): Promise<number> {
    const before = this.transactions.length;
    this.transactions = this.transactions.filter(
      (transaction) =>
        !(
          transaction.transferId === transferId &&
          transaction.userId === userId
        ),
    );
    return Promise.resolve(before - this.transactions.length);
  }

  async deleteMany(userId: string, ids: string[]): Promise<number> {
    const before = this.transactions.length;
    this.transactions = await Promise.resolve(
      this.transactions.filter(
        (transaction) =>
          !(ids.includes(transaction._id) && transaction.userId === userId),
      ),
    );
    return before - this.transactions.length;
  }

  async deleteByAccount(userId: string, accountId: string): Promise<number> {
    const transferIds = new Set(
      this.transactions
        .filter(
          (transaction) =>
            transaction.userId === userId &&
            transaction.accountId === accountId &&
            transaction.transferId,
        )
        .map((transaction) => transaction.transferId),
    );

    const before = this.transactions.length;
    this.transactions = this.transactions.filter(
      (transaction) =>
        !(
          transaction.userId === userId &&
          (transaction.accountId === accountId ||
            (transaction.transferId &&
              transferIds.has(transaction.transferId)))
        ),
    );
    return Promise.resolve(before - this.transactions.length);
  }

  async deleteAllForUser(userId: string): Promise<number> {
    const before = this.transactions.length;
    this.transactions = this.transactions.filter(
      (transaction) => transaction.userId !== userId,
    );
    return Promise.resolve(before - this.transactions.length);
  }

  saveMany(transactions: TransactionDTO[]): Promise<void> {
    for (const dto of transactions) {
      this.transactions.push({
        ...dto,
        // DTO carries the category id as a string; the in-memory store keeps the
        // populated shape, so wrap it minimally for tests that read it back.
        category: dto.category as unknown as Transaction["category"],
        _id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    return Promise.resolve();
  }

  findForDedup(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<DedupTransaction[]> {
    return Promise.resolve(
      this.transactions
        .filter(
          (transaction) =>
            transaction.userId === userId &&
            transaction.date >= from &&
            transaction.date <= to,
        )
        .map(({ date, value, type, description }) => ({
          date,
          value,
          type,
          description,
        })),
    );
  }

  firstDateRecord(userId: string): Promise<{ firstDate: Date } | null> {
    const userTransactions = this.transactions.filter(
      (transaction) => transaction.userId === userId,
    );

    if (userTransactions.length === 0) {
      return Promise.resolve(null); // No hay registros, devuelve null
    } else {
      let oldestDate: Date = userTransactions[0].date;
      for (let i = 1; i < userTransactions.length; i++) {
        if (userTransactions[i].date < oldestDate) {
          oldestDate = userTransactions[i].date;
        }
      }
      return Promise.resolve({ firstDate: oldestDate });
    }
  }

  existsForAccount(accountId: string): Promise<boolean> {
    return Promise.resolve(
      this.transactions.some((transaction) => transaction.accountId === accountId),
    );
  }

  hasOwnerlessTransactions(): Promise<boolean> {
    return Promise.resolve(
      this.transactions.some((transaction) => !transaction.accountId),
    );
  }

  migrateOwnerlessTransactions(
    userId: string,
    defaultAccountId: string,
  ): Promise<number> {
    let migrated = 0;

    this.transactions = this.transactions.map((transaction) => {
      if (!transaction.accountId) {
        migrated += 1;
        return { ...transaction, userId, accountId: defaultAccountId };
      }

      return transaction;
    });

    return Promise.resolve(migrated);
  }

  getFrequentCombos(
    userId: string,
    accountId?: string,
    limit = 5,
  ): Promise<FrequentComboDTO[]> {
    const scoped = this.transactions.filter(
      (transaction) =>
        transaction.userId === userId &&
        (!accountId || transaction.accountId === accountId) &&
        !!transaction.category,
    );

    const groups = new Map<
      string,
      { combo: FrequentComboDTO; count: number }
    >();

    for (const transaction of scoped) {
      const key = [
        transaction.description,
        transaction.category._id,
        transaction.accountId,
        transaction.type,
      ].join("|");

      const existing = groups.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        groups.set(key, {
          count: 1,
          combo: {
            description: transaction.description,
            type: transaction.type,
            accountId: transaction.accountId,
            category: {
              _id: transaction.category._id,
              name: transaction.category.name,
              icon: transaction.category.icon,
            },
            count: 1,
          },
        });
      }
    }

    const sorted = Array.from(groups.values())
      .sort((a, b) => b.count - a.count)
      .map(({ combo, count }) => ({ ...combo, count }))
      .slice(0, limit);

    return Promise.resolve(sorted);
  }
}
