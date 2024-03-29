import { TransactionAggregate } from "../../domain/aggregates/transaction.aggregate.ts";
import { Transaction } from "../../domain/entities/transaction.entity.ts";
import { TransactionType } from "../../domain/valueObjects/transactionType.valueObject.ts";
import { groupDataBy } from "../utils/groupBy.ts";

export const groupTransactions = (
  transactions: Transaction[],
): TransactionAggregate[] => {
  const groupedTransactions = groupDataBy(
    transactions,
    (item) => item.date.toJSON(),
  );

  const transactionAggregates = groupedTransactions.map(
    (group): TransactionAggregate => {
      const balance = {
        incomes: 0,
        expenses: 0,
        balance: 0,
      };
      let minDate!: Date;
      let maxDate!: Date;

      group.data.forEach((transaction) => {
        balance.incomes += transaction.type === TransactionType.income
          ? transaction.value
          : 0;
        balance.expenses += transaction.type === TransactionType.expenses
          ? transaction.value
          : 0;
        balance.balance = balance.incomes - balance.expenses;

        minDate = minDate && minDate.getTime() < transaction.date.getTime()
          ? minDate
          : transaction.date;
        maxDate = maxDate && maxDate.getTime() > transaction.date.getTime()
          ? maxDate
          : transaction.date;
      });

      return {
        _id: group.id,
        transactions: group.data,
        minDate: minDate,
        maxDate: maxDate,
        balance,
      };
    },
  );

  return transactionAggregates;
};
