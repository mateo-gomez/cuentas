import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts";
import { TransactionRepository } from "../../../../src/features/transaction/domain/Transaction.repository";
import { Transaction } from "../../../../src/features/transaction/domain/transaction.entity";
import { TransactionType } from "../../../../src/domain/valueObjects/transactionType.valueObject";
import { GroupedTransactionByDayGetter } from "../../../../src/features/transaction/application/groupedTransactionByDayGetter";
import { TransactionAggregate } from "../../../../src/features/transaction/domain/transaction.aggregate";
import { TransactionAggregateService } from "../../../../src/features/transaction/application/TransactionAggregateService";

class PartialMockTransactionRepository
  implements Partial<TransactionRepository> {
  getAll = (): Promise<Transaction[]> =>
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

Deno.test("GroupedTransactionByDayGetter - Returns grouped transactions by day successfully", async () => {
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
  const transactionRepository = new PartialMockTransactionRepository();
  const transactionAggregateService = new TransactionAggregateService();

  const groupedTransactionByDayGetter = new GroupedTransactionByDayGetter(
    transactionRepository as TransactionRepository,
    transactionAggregateService,
  );

  // Act
  const transactionAggregates = await groupedTransactionByDayGetter.execute();

  // Assert
  assertEquals(transactionAggregates, expectedTransactionAggregates);
});
