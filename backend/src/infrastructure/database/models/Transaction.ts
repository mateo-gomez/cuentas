import { model, Schema, Types } from "../../../../deps.ts";
import { Category } from "./Category.ts";

export enum TransactionType {
  expenses,
  income,
}

interface AccumulatorState {
  incomes: number;
  expenses: number;
}

export type GroupBy = "year" | "month" | "day" | "week";

export interface Transaction {
  _id: string;
  date: Date;
  value: number;
  account: string;
  type: number;
  category: Category;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const getGroupBySentence = (groupBy: GroupBy) => {
  const dateFormats = {
    year: "%Y",
    month: "%Y-%m",
    day: "%Y-%m-%d",
    week: "%Y - %U",
  };

  return {
    $group: {
      _id: {
        $dateToString: { format: dateFormats[groupBy], date: "$date" },
      },
      transactions: { $push: "$$ROOT" },
      minDate: { $min: "$date" },
      maxDate: { $max: "$date" },
      balance: {
        $accumulator: {
          init: function () {
            return {
              incomes: 0,
              expenses: 0,
            };
          },
          accumulate: function (
            state: AccumulatorState,
            value: number,
            type: TransactionType,
          ) {
            const incomes = type === 1 ? value : 0;
            const expenses = type === 0 ? value : 0;

            return {
              incomes: state.incomes + incomes,
              expenses: state.expenses + expenses,
            };
          },
          accumulateArgs: ["$value", "$type"],
          merge: function (state1: AccumulatorState, state2: AccumulatorState) {
            return {
              incomes: state1.incomes + state2.incomes,
              expenses: state1.expenses + state2.expenses,
            };
          },
          finalize: function (state: AccumulatorState) {
            return {
              incomes: state.incomes,
              expenses: state.expenses,
              balance: state.incomes - state.expenses,
            };
          },
          lang: "js",
        },
      },
    },
  };
};

const transactionSchema = new Schema(
  {
    date: { type: Date },
    value: { type: Number, default: 0 },
    account: { type: String },
    category: { type: Types.ObjectId, ref: "Category", required: true },
    type: { type: Number, TransactionType },
    description: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    statics: {
      groupDateBy(groupBy: GroupBy) {
        return this.aggregate([
          {
            $lookup: {
              from: "categories",
              localField: "categoryId",
              foreignField: "_id",
              as: "category",
            },
          },
          { $unwind: "$category" },
          getGroupBySentence(groupBy),
          { $sort: { _id: -1 } },
        ]);
      },
      groupDateByMatchYear(groupBy: GroupBy, year: string) {
        const startDateYear = new Date(`${year}-01-01`);
        const endDateYear = new Date(`${Number(year) + 1}-01-01`);

        return this.aggregate([
          {
            $match: { date: { $gte: startDateYear, $lt: endDateYear } },
          },
          {
            $lookup: {
              from: "categories",
              localField: "categoryId",
              foreignField: "_id",
              as: "category",
            },
          },
          { $unwind: "$category" },
          getGroupBySentence(groupBy),
          { $sort: { _id: -1 } },
        ]);
      },
      groupDateByMatchMonth(groupBy: GroupBy, year: string, month: string) {
        const startDateYear = new Date(`${year}-01-01`);
        const endDateYear = new Date(`${year + 1}-${month + 1}-01`);

        return this.aggregate([
          {
            $match: { date: { $gte: startDateYear, $lt: endDateYear } },
          },
          {
            $lookup: {
              from: "categories",
              localField: "categoryId",
              foreignField: "_id",
              as: "category",
            },
          },
          { $unwind: "$category" },
          getGroupBySentence(groupBy),
          { $sort: { _id: -1 } },
        ]);
      },
    },
  },
);

export default model<Transaction>("Transaction", transactionSchema);
