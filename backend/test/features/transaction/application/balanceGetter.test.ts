import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts";
import { TransactionRepository } from "../../../../src/features/transaction/domain/Transaction.repository";
import { Balance } from "../../../../src/features/transaction/domain/balance.entity";
import { BalanceGetter } from "../../../../src/features/transaction/application/balanceGetter";

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
