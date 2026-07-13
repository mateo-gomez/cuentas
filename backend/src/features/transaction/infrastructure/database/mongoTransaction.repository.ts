import { Types } from "mongoose";
import { Balance } from "../../domain/balance.entity";
import { Transaction } from "../../domain/transaction.entity";
import {
  DedupTransaction,
  TransactionRepository,
} from "../../domain/Transaction.repository";
import { DatabaseError } from "../../../../infrastructure/api/errors/databaseError";
import TransactionModel from "./Transaction";
import { TransactionDTO } from "../../application/dto/transactionDTO";
import { FrequentComboDTO } from "../../application/dto/frequentComboDTO";

// Aggregation pipelines ($match) bypass mongoose's automatic query-cast, so
// userId/accountId must be cast to ObjectId explicitly here (unlike `find`,
// which casts based on the schema type).
const toObjectId = (id: string) => new Types.ObjectId(id);

export class MongoTransactionRepository implements TransactionRepository {
  exists = async (userId: string, id: string): Promise<boolean> => {
    const exists = await TransactionModel.exists({ _id: id, userId });

    return exists !== null;
  };

  findOne = async (
    userId: string,
    id: string,
  ): Promise<Transaction | null> => {
    const doc = await TransactionModel.findOne({ _id: id, userId })
      .populate("category")
      .lean();
    return doc as unknown as Transaction | null;
  };

  getAll = async (
    userId: string,
    accountId?: string,
  ): Promise<Transaction[]> => {
    const docs = await TransactionModel.find({
      userId,
      ...(accountId ? { accountId } : {}),
    })
      .sort({ date: "desc" })
      .populate("category")
      .lean();
    return docs as unknown as Transaction[];
  };

  getBetweenDates = async (
    userId: string,
    startDate: Date,
    endDate: Date,
    accountId?: string,
  ): Promise<Transaction[]> => {
    const docs = await TransactionModel.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
      ...(accountId ? { accountId } : {}),
    })
      .sort({ date: "desc" })
      .populate("category")
      .lean();
    return docs as unknown as Transaction[];
  };

  sumAll = async (userId: string, accountId?: string): Promise<Balance> => {
    const [balance] = await TransactionModel.aggregate<Balance | undefined>([
      {
        $match: {
          userId: toObjectId(userId),
          ...(accountId ? { accountId: toObjectId(accountId) } : {}),
        },
      },
      {
        $group: {
          _id: null,
          // TransactionType enum: expenses = 0, income = 1
          incomes: {
            $sum: {
              $cond: { if: { $eq: ["$type", 1] }, then: "$value", else: 0 },
            },
          },
          expenses: {
            $sum: {
              $cond: { if: { $eq: ["$type", 0] }, then: "$value", else: 0 },
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
    userId: string,
    startDate: Date,
    endDate: Date,
    accountId?: string,
  ): Promise<Balance> => {
    const [balance] = await TransactionModel.aggregate<Balance | undefined>([
      {
        $match: {
          userId: toObjectId(userId),
          date: { $gte: startDate, $lte: endDate },
          ...(accountId ? { accountId: toObjectId(accountId) } : {}),
        },
      },
      {
        $group: {
          _id: null,
          // TransactionType enum: expenses = 0, income = 1
          incomes: {
            $sum: {
              $cond: { if: { $eq: ["$type", 1] }, then: "$value", else: 0 },
            },
          },
          expenses: {
            $sum: {
              $cond: { if: { $eq: ["$type", 0] }, then: "$value", else: 0 },
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
    const doc = await TransactionModel.create(newTransaction);
    return doc as unknown as Transaction;
  };

  updateTransaction = async (
    userId: string,
    id: string,
    transactionData: Omit<Transaction, "_id" | "createdAt" | "updatedAt">,
  ): Promise<Transaction | null> => {
    const transaction = await TransactionModel.findOneAndUpdate(
      { _id: id, userId },
      transactionData,
      { returnDocument: "after", lean: true },
    ).lean();

    return transaction as unknown as Transaction | null;
  };

  delete = async (userId: string, id: string): Promise<void> => {
    const { deletedCount } = await TransactionModel.deleteOne({
      _id: id,
      userId,
    });

    if (deletedCount === 0) {
      throw new DatabaseError(`Error eliminando transacción ${id}`);
    }
  };

  deleteMany = async (userId: string, ids: string[]): Promise<number> => {
    const { deletedCount } = await TransactionModel.deleteMany({
      _id: { $in: ids },
      userId,
    });

    return deletedCount;
  };

  firstDateRecord = async (
    userId: string,
  ): Promise<{ firstDate: Date } | null> => {
    const transaction = await TransactionModel.findOne({ userId })
      .sort({ date: "asc" })
      .select("date")
      .lean();

    const firstDate = transaction?.date;

    return firstDate ? { firstDate } : null;
  };

  saveMany = async (transactions: TransactionDTO[]) => {
    await TransactionModel.insertMany(transactions);
  };

  findForDedup = async (
    userId: string,
    from: Date,
    to: Date,
  ): Promise<DedupTransaction[]> => {
    return await TransactionModel.find({
      userId,
      date: { $gte: from, $lte: to },
    })
      .select("date value type description")
      .lean();
  };

  existsForAccount = async (accountId: string): Promise<boolean> => {
    const exists = await TransactionModel.exists({ accountId });

    return exists !== null;
  };

  hasOwnerlessTransactions = async (): Promise<boolean> => {
    const exists = await TransactionModel.exists({
      accountId: { $exists: false },
    });

    return exists !== null;
  };

  migrateOwnerlessTransactions = async (
    userId: string,
    defaultAccountId: string,
  ): Promise<number> => {
    const { modifiedCount } = await TransactionModel.updateMany(
      { accountId: { $exists: false } },
      { $set: { accountId: defaultAccountId, userId } },
    );

    return modifiedCount;
  };

  getFrequentCombos = async (
    userId: string,
    accountId?: string,
    limit = 5,
  ): Promise<FrequentComboDTO[]> => {
    const combos = await TransactionModel.aggregate<FrequentComboDTO>([
      {
        $match: {
          userId: toObjectId(userId),
          ...(accountId ? { accountId: toObjectId(accountId) } : {}),
        },
      },
      {
        $group: {
          _id: {
            category: "$category",
            accountId: "$accountId",
            description: "$description",
            // TransactionType enum: expenses = 0, income = 1 — passed raw,
            // never inverted, so expense/income combos are never merged.
            type: "$type",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $lookup: {
          from: "categories",
          localField: "_id.category",
          foreignField: "_id",
          as: "cat",
        },
      },
      // Null-safe: skip combos whose category has since been deleted.
      { $match: { cat: { $ne: [] } } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          description: "$_id.description",
          type: "$_id.type",
          accountId: "$_id.accountId",
          category: {
            _id: { $arrayElemAt: ["$cat._id", 0] },
            name: { $arrayElemAt: ["$cat.name", 0] },
            icon: { $arrayElemAt: ["$cat.icon", 0] },
          },
          count: 1,
        },
      },
    ]);

    return combos;
  };
}
