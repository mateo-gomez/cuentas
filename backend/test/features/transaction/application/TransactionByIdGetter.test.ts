import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts";
import { TransactionRepository } from "../../../../src/features/transaction/domain/Transaction.repository";
import { Transaction } from "../../../../src/features/transaction/domain/transaction.entity";
import { TransactionType } from "../../../../src/domain/valueObjects/transactionType.valueObject";
import { TransactionByIdGetter } from "../../../../src/features/transaction/application/TransactionByIdGetter";

class MockTransactionRepository implements Partial<TransactionRepository> {
  findOne = (id: string): Promise<Transaction | null> => {
    // Here you can simulate a repository response based on the provided id
    if (id === "1") {
      return Promise.resolve({
        _id: "1",
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
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      return Promise.resolve(null);
    }
  };
}

Deno.test("TransactionByIdGetter - Returns the transaction when it exists", async () => {
  // Arrange
  const id = "1";
  const expectedTransaction: Transaction = {
    _id: "1",
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
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const transactionByIdGetter = new TransactionByIdGetter(
    new MockTransactionRepository() as TransactionRepository,
  );

  // Act
  const transaction = await transactionByIdGetter.execute(id);

  // Assert
  assertEquals(transaction, expectedTransaction);
});

Deno.test("TransactionByIdGetter - Returns null when the transaction does not exist", async () => {
  // Arrange
  const id = "nonexistentId";
  const transactionByIdGetter = new TransactionByIdGetter(
    new MockTransactionRepository() as TransactionRepository,
  );

  // Act
  const transaction = await transactionByIdGetter.execute(id);

  // Assert
  assertEquals(transaction, null);
});
