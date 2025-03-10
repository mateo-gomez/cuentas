import { Balance } from "../../domain/balance.entity";
import { Transaction } from "../../domain/transaction.entity";
import { TransactionRepository } from "../../domain/Transaction.repository";
import { DatabaseError } from "../../../../infrastructure/api/errors/databaseError";
import TransactionModel from "./Transaction";

export class MongoTransactionRepository implements TransactionRepository {
  exists = async (id: string): Promise<boolean> => {
    const exists = await TransactionModel.exists({ _id: id });

    return exists !== null;
  };

  findOne = async (id: string): Promise<Transaction | null> => {
    return await TransactionModel.findOne({ _id: id })
      .populate("category")
      .lean();
  };

  getAll = async (): Promise<Transaction[]> => {
    return await TransactionModel.find()
      .sort({ date: "desc" })
      .populate("category")
      .lean();
  };

  getBetweenDates = async (
    startDate: Date,
    endDate: Date,
  ): Promise<Transaction[]> => {
    return await TransactionModel.find({
      date: { $gte: startDate, $lte: endDate },
    })
      .sort({ date: "desc" })
      .populate("category")
      .lean();
  };

  sumAll = async (): Promise<Balance> => {
    const [balance] = await TransactionModel.aggregate<Balance | undefined>([
      {
        $group: {
          _id: null,
          incomes: {
            $sum: {
              $cond: { if: { $eq: ["$type", 0] }, then: "$value", else: 0 },
            },
          },
          expenses: {
            $sum: {
              $cond: { if: { $eq: ["$type", 1] }, then: "$value", else: 0 },
            },
          },
        },
      },
      {
        $addFields: {
          balance: { $subtract: ["$incomes", "$expenses"] },
        },
      },
    ]);

    return {
      incomes: balance?.incomes || 0,
      expenses: balance?.expenses || 0,
      balance: balance?.balance || 0,
    };
  };

  sumBetweenDates = async (
    startDate: Date,
    endDate: Date,
  ): Promise<Balance> => {
    const [balance] = await TransactionModel.aggregate<Balance | undefined>([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          incomes: {
            $sum: {
              $cond: { if: { $eq: ["$type", 0] }, then: "$value", else: 0 },
            },
          },
          expenses: {
            $sum: {
              $cond: { if: { $eq: ["$type", 1] }, then: "$value", else: 0 },
            },
          },
        },
      },
      {
        $addFields: {
          balance: { $subtract: ["$incomes", "$expenses"] },
        },
      },
    ]);

    return {
      incomes: balance?.incomes || 0,
      expenses: balance?.expenses || 0,
      balance: balance?.balance || 0,
    };
  };

  createTransaction = async (
    newTransaction: Omit<Transaction, "_id" | "createdAt" | "updatedAt">,
  ): Promise<Transaction> => {
    return await TransactionModel.create(newTransaction);
  };

  updateTransaction = async (
    id: string,
    transactionData: Omit<Transaction, "_id" | "createdAt" | "updatedAt">,
  ): Promise<Transaction | null> => {
    const transaction = await TransactionModel.findByIdAndUpdate(
      { _id: id },
      transactionData,
      { returnDocument: "after", lean: true },
    ).lean();

    return transaction;
  };

  delete = async (id: string): Promise<void> => {
    const { deletedCount } = await TransactionModel.remove({ _id: id });

    if (deletedCount === 0) {
      throw new DatabaseError(`Error eliminando transacción ${id}`);
    }
  };

  firstDateRecord = async (): Promise<{ firstDate: Date } | null> => {
    const transaction = await TransactionModel.findOne()
      .sort({ date: "asc" })
      .select("date")
      .lean();

    const firstDate = transaction?.date;

    return firstDate ? { firstDate } : null;
  };
}
