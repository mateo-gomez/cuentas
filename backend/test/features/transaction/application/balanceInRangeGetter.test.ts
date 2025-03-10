import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts";
import { Balance } from "../../../../src/features/transaction/domain/balance.entity";
import { TransactionRepository } from "../../../../src/features/transaction/domain/Transaction.repository";
import { BalanceInRangeGetter } from "../../../../src/features/transaction/application/balanceInRangeGetter";

class PartialMockTransactionRepository
  implements Partial<TransactionRepository> {
  sumBetweenDates = (): Promise<Balance> => {
    return Promise.resolve({
      incomes: 5000,
      expenses: 3000,
      balance: 2000,
    });
  };
}

Deno.test("BalanceInRangeGetter - Returns balance in a range of dates successfully", async () => {
  // Arrange
  const expectedBalance: Balance = {
    incomes: 5000,
    expenses: 3000,
    balance: 2000,
  };
  const startDate = new Date("2024-01-01");
  const endDate = new Date("2024-01-31");
  const transactionRepository = new PartialMockTransactionRepository();
  const balanceInRangeGetter = new BalanceInRangeGetter(
    transactionRepository as unknown as TransactionRepository,
  );

  // Act
  const balance = await balanceInRangeGetter.execute(startDate, endDate);

  // Assert
  assertEquals(balance, expectedBalance);
});
