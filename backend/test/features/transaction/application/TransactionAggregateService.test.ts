import { assertEquals } from "https://deno.land/std@0.221.0/assert/assert_equals";
import { Transaction } from "../../../../src/features/transaction/domain/transaction.entity";
import { TransactionType } from "../../../../src/domain/valueObjects/transactionType.valueObject";
import { TransactionAggregateService } from "../../../../src/features/transaction/application/TransactionAggregateService";

Deno.test("TransactionAggregateService - Aggregates transactions correctly", () => {
  // Arrange
  const transactions: Transaction[] = [
    {
      _id: "1",
      date: new Date("2024-01-01"),
      value: 100,
      account: "account1",
      category: {
        _id: "categoryId1",
        name: "Category 1",
        icon: "icon1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      type: TransactionType.income,
      description: "Income transaction",
      createdAt: new Date(),
      updatedAt: new Date(),
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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      type: TransactionType.expenses,
      description: "Expense transaction",
      createdAt: new Date(),
      updatedAt: new Date(),
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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      type: TransactionType.income,
      description: "Income transaction 2",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  const transactionAggregateService = new TransactionAggregateService();
  const expectedTransactionAggregates = [
    {
      _id: "2024-01-01T00:00:00.000Z",
      transactions: [
        transactions[0],
        transactions[1],
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
        transactions[2],
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

  // Act
  const result = transactionAggregateService.execute(transactions);

  // Assert
  assertEquals(result, expectedTransactionAggregates);
});
