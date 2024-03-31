import { TransactionAggregate } from "../../domain/aggregates/transaction.aggregate.ts";
import { Transaction } from "../../domain/entities/transaction.entity.ts";
import { TransactionType } from "../../domain/valueObjects/transactionType.valueObject.ts";
import { groupDataBy } from "../utils/groupBy.ts";

export class TransactionAggregateService {
  execute = (transactions: Transaction[]): TransactionAggregate[] => {
    const groupedTransactions = groupDataBy(
      transactions,
      (item) => item.date.toJSON(),
    );

    const transactionAggregates = groupedTransactions.map(
      (group): TransactionAggregate => {
        const dates = group.data.map((t: Transaction) => t.date.getTime());
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        const incomes = group.data.filter((t: Transaction) =>
          t.type === TransactionType.income
        ).reduce((sum: number, t: Transaction) => sum + t.value, 0);
        const expenses = group.data.filter((t: Transaction) =>
          t.type === TransactionType.expenses
        ).reduce((sum: number, t: Transaction) => sum + t.value, 0);
        const balance = incomes - expenses;

        return {
          _id: group.id,
          transactions: group.data,
          minDate,
          maxDate,
          balance: {
            incomes,
            expenses,
            balance,
          },
        };
      },
    );

    return transactionAggregates;
  };
}
