import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts.ts";
import { TransactionRepository } from "../../../domain/repositories/Transaction.repository.ts";
import { Balance } from "../../../domain/entities/balance.entity.ts";
import { BalanceGetter } from "./balanceGetter.ts";

class PartialMockTransactionRepository
  implements Partial<TransactionRepository> {
  sumAll = (): Promise<Balance> => {
    return Promise.resolve({
      incomes: 5000,
      expenses: 3000,
      balance: 2000,
    });
  };
}

Deno.test("BalanceGetter - Returns balance successfully", async () => {
  // Arrange
  const expectedBalance: Balance = {
    incomes: 5000,
    expenses: 3000,
    balance: 2000,
  };
  const transactionRepository = new PartialMockTransactionRepository();
  const balanceGetter = new BalanceGetter(
    transactionRepository as TransactionRepository,
  );

  // Act
  const balance = await balanceGetter.execute();

  // Assert
  assertEquals(balance, expectedBalance);
});
