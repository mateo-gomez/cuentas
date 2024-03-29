import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts.ts";
import {
  TransactionRepository,
} from "../../../domain/repositories/Transaction.repository.ts";
import { Transaction } from "../../../domain/entities/transaction.entity.ts";
import { TransactionType } from "../../../domain/valueObjects/transactionType.valueObject.ts";
import { TransactionCreator } from "./transactionCreator.ts";

class MockTransactionRepository implements Partial<TransactionRepository> {
  createTransaction = (
    newTransaction: Omit<Transaction, "_id" | "createdAt" | "updatedAt">,
  ): Promise<Transaction> =>
    Promise.resolve({
      ...newTransaction,
      _id: "newId",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
}

Deno.test("TransactionCreator - Creates a new transaction successfully", async () => {
  // Arrange
  const newTransaction: Omit<Transaction, "_id" | "createdAt" | "updatedAt"> = {
    date: new Date(),
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
  };
  const expectedTransaction: Transaction = {
    ...newTransaction,
    _id: "newId",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const transactionCreator = new TransactionCreator(
    new MockTransactionRepository() as TransactionRepository,
  );

  // Act
  const createdTransaction = await transactionCreator.execute(newTransaction);

  // Assert
  assertEquals(createdTransaction, expectedTransaction);
});
