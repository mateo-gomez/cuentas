import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts.ts";
import {
  TransactionRepository,
} from "../../../domain/repositories/Transaction.repository.ts";
import { Transaction } from "../../../domain/entities/transaction.entity.ts";
import { TransactionType } from "../../../domain/valueObjects/transactionType.valueObject.ts";
import { TransactionAggregate } from "../../../domain/aggregates/transaction.aggregate.ts";
import { GroupedTransactionByDayInRangeGetter } from "./groupedTransactionByDayInRangeGetter.ts";

class PartialMockTransactionRepository
  implements Partial<TransactionRepository> {
  getBetweenDates = (): Promise<Transaction[]> =>
    Promise.resolve([
      {
        _id: "1",
        date: new Date("2024-01-01"),
        value: 100,
        account: "account1",
        category: {
          _id: "categoryId1",
          name: "Category 1",
          icon: "icon1",
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
        type: TransactionType.income,
        description: "Income transaction",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
      {
        _id: "2",
        date: new Date("2024-01-01"),
        value: 50,
        account: "account2",
        category: {
          _id: "categoryId2",
          name: "Category 2",
          icon: "icon2",
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
        type: TransactionType.expenses,
        description: "Expense transaction",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
      {
        _id: "3",
        date: new Date("2024-01-02"),
        value: 200,
        account: "account3",
        category: {
          _id: "categoryId3",
          name: "Category 3",
          icon: "icon3",
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
        type: TransactionType.income,
        description: "Income transaction 2",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
    ]);
}

Deno.test("GroupedTransactionByDayInRangeGetter - Return grouped transactions by day ina range of dates successfully", async () => {
  // Arrange
  const expectedTransactionAggregates: TransactionAggregate[] = [
    {
      _id: "2024-01-01T00:00:00.000Z",
      transactions: [
        {
          _id: "1",
          date: new Date("2024-01-01"),
          value: 100,
          account: "account1",
          category: {
            _id: "categoryId1",
            name: "Category 1",
            icon: "icon1",
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01"),
          },
          type: TransactionType.income,
          description: "Income transaction",
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
        {
          _id: "2",
          date: new Date("2024-01-01"),
          value: 50,
          account: "account2",
          category: {
            _id: "categoryId2",
            name: "Category 2",
            icon: "icon2",
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01"),
          },
          type: TransactionType.expenses,
          description: "Expense transaction",
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
      ],
      minDate: new Date("2024-01-01"),
      maxDate: new Date("2024-01-01"),
      balance: {
        incomes: 100,
        expenses: 50,
        balance: 50,
      },
    },
    {
      _id: "2024-01-02T00:00:00.000Z",
      transactions: [
        {
          _id: "3",
          date: new Date("2024-01-02"),
          value: 200,
          account: "account3",
          category: {
            _id: "categoryId3",
            name: "Category 3",
            icon: "icon3",
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01"),
          },
          type: TransactionType.income,
          description: "Income transaction 2",
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
      ],
      minDate: new Date("2024-01-02"),
      maxDate: new Date("2024-01-02"),
      balance: {
        incomes: 200,
        expenses: 0,
        balance: 200,
      },
    },
  ];
  const startDate = new Date("2024-01-01");
  const endDate = new Date("2024-01-02");
  const transactionRepository = new PartialMockTransactionRepository();
  const groupedTransactionByDayInRangeGetter =
    new GroupedTransactionByDayInRangeGetter(
      transactionRepository as unknown as TransactionRepository,
    );

  // Act
  const transactionAggregates = await groupedTransactionByDayInRangeGetter
    .execute(startDate, endDate);

  // Assert
  assertEquals(transactionAggregates, expectedTransactionAggregates);
});
