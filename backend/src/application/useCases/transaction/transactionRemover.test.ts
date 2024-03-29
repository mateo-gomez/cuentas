import {
  assertRejects,
} from "https://deno.land/std@0.152.0/testing/asserts.ts";
import {
  TransactionRepository,
} from "../../../domain/repositories/Transaction.repository.ts";
import { NotFoundError } from "../../errors/notFoundError.ts";
import { TransactionRemover } from "./transactionRemover.ts";
import { ApplicationError } from "../../errors/applicationError.ts";

class PartialMockTransactionRepository
  implements Partial<TransactionRepository> {
  exists = (id: string): Promise<boolean> =>
    Promise.resolve(id === "existingId" || id === "withError");

  // deno-lint-ignore require-await
  delete = async (id: string): Promise<void> => {
    if (id !== "existingId") {
      throw new Error("Failed to delete transaction");
    }
  };
}

Deno.test("TransactionRemover - Removes an existing transaction successfully", async () => {
  // Arrange
  const transactionRepository = new PartialMockTransactionRepository();
  const transactionRemover = new TransactionRemover(
    transactionRepository as TransactionRepository,
  );

  // Act
  await transactionRemover.execute("existingId");

  // Assert
  // No assertions needed as the test is successful if no error is thrown
});

Deno.test("TransactionRemover - Throws NotFoundError when the transaction does not exist", () => {
  // Arrange
  const transactionRepository = new PartialMockTransactionRepository();
  const transactionRemover = new TransactionRemover(
    transactionRepository as TransactionRepository,
  );

  // Act and Assert
  assertRejects(
    () => transactionRemover.execute("nonExistingId"),
    NotFoundError,
    "Categoría no encontrada",
  );
});

Deno.test("TransactionRemover - Throws an error when deletion fails", () => {
  // Arrange
  const transactionRepository = new PartialMockTransactionRepository();
  const transactionRemover = new TransactionRemover(
    transactionRepository as TransactionRepository,
  );

  // Act and Assert
  assertRejects(
    () => transactionRemover.execute("withError"),
    ApplicationError,
    "Error al eliminar categoría",
  );
});
