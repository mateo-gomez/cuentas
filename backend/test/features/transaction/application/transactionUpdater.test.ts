import { assertEquals } from "https://deno.land/std@0.221.0/assert/assert_equals.ts";
import { Transaction } from "../../../../src/features/transaction/domain/transaction.entity.ts";
import { TransactionRepository } from "../../../../src/features/transaction/domain/Transaction.repository.ts";
import { TransactionType } from "../../../../src/domain/valueObjects/transactionType.valueObject.ts";
import { ApplicationError } from "../../../../src/application/errors/applicationError.ts";
import { NotFoundError } from "../../../../src/application/errors/notFoundError.ts";
import { TransactionUpdater } from "../../../../src/features/transaction/application/transactionUpdater.ts";
import { assertRejects } from "https://deno.land/std@0.221.0/assert/assert_rejects.ts";

class PartialMockTransactionRepository
  implements Partial<TransactionRepository> {
  findOne = (id: string): Promise<Transaction | null> => {
    if (id === "existingId" || id === "existingWithError") {
      return Promise.resolve({
        _id: "existingId",
        date: new Date(),
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
      });
    } else {
      return Promise.resolve(null);
    }
  };

  updateTransaction = (
    id: string,
    updatedTransaction: Partial<Transaction>,
  ): Promise<Transaction | null> => {
    if (id === "existingId") {
      return Promise.resolve({
        ...updatedTransaction as Transaction,
        _id: "existingId",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      });
    }

    if (id === "existingWithError") {
      throw new Error("");
    }

    return Promise.resolve(null);
  };
}

Deno.test("TransactionUpdater - Updates an existing transaction successfully", async () => {
  // Arrange
  const transactionRepository = new PartialMockTransactionRepository();
  const transactionUpdater = new TransactionUpdater(
    transactionRepository as TransactionRepository,
  );
  const id = "existingId";
  const updatedTransactionData: Partial<Transaction> = {
    value: 200,
  };
  const expectedUpdatedTransaction: Transaction = {
    _id: "existingId",
    date: new Date(),
    value: 200,
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
    updatedAt: new Date("2024-01-02"),
  };

  // Act
  const updatedTransaction = await transactionUpdater.execute(
    id,
    updatedTransactionData,
  );

  // Assert
  assertEquals(updatedTransaction, expectedUpdatedTransaction);
});

Deno.test("TransactionUpdater - Throws NotFoundError when the transaction does not exist", async () => {
  // Arrange
  const transactionRepository = new PartialMockTransactionRepository();
  const transactionUpdater = new TransactionUpdater(
    transactionRepository as TransactionRepository,
  );
  const id = "nonExistingId";
  const updatedTransactionData: Partial<Transaction> = {
    value: 200,
  };

  // Act and Assert
  await assertRejects(
    () => transactionUpdater.execute(id, updatedTransactionData),
    NotFoundError,
    "Transacción no encontrada",
  );
});

Deno.test("TransactionUpdater - Throws an error when updating fails", async () => {
  // Arrange
  const transactionRepository = new PartialMockTransactionRepository();
  const transactionUpdater = new TransactionUpdater(
    transactionRepository as TransactionRepository,
  );
  const id = "existingWithError";
  const updatedTransactionData: Partial<Transaction> = {
    value: 200,
  };

  // Act and Assert
  await assertRejects(
    () => transactionUpdater.execute(id, updatedTransactionData),
    ApplicationError,
    "Error al guardar transacción",
  );
});
