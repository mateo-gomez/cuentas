import { Balance } from "../../../domain/entities/balance.entity.ts";
import { Transaction } from "../../../domain/entities/transaction.entity.ts";
import {
  TransactionRepository,
} from "../../../domain/repositories/Transaction.repository.ts";
import TransactionModel from "../../models/Transaction.ts";

export class MongoTransactionRepository implements TransactionRepository {
  findOne = async (id: string): Promise<Transaction | null> => {
    return await TransactionModel.findOne({ _id: id }).populate("category");
  };

  getAll = async (): Promise<Transaction[]> => {
    return await TransactionModel.find().sort({ date: "desc" }).populate(
      "category",
    );
  };

  getBetweenDates = async (from: Date, to: Date): Promise<Transaction[]> => {
    return await TransactionModel.find({
      date: { $gte: from, $lte: to },
    }).sort({ date: "desc" });
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
    from: Date,
    to: Date,
  ): Promise<Balance> => {
    const [balance] = await TransactionModel.aggregate<Balance | undefined>([
      {
        $match: {
          date: { $gte: from, $lte: to },
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
  ): Promise<Transaction> => {
    const transaction = await TransactionModel
      .findByIdAndUpdate(
        { _id: id },
        transactionData,
        { returnDocument: "after", lean: true },
      )
      .lean();

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    return transaction;
  };
}
