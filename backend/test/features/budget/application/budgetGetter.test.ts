import { BudgetGetter } from "../../../../src/features/budget/application/budgetGetter";
import { InMemoryBudgetRepository } from "../../../../src/features/budget/infrastructure/database/inMemoryBudget.repository";
import { InMemoryTransactionRepository } from "../../../../src/features/transaction/infrastructure/database/InMemoryTransaction.repository";
import { TransactionType } from "../../../../src/domain/valueObjects/transactionType.valueObject";
import { TransactionRepository } from "../../../../src/features/transaction/domain/Transaction.repository";

const USER_ID = "user-1";
const YEAR = 2026;
const MONTH = 5;

const makeTransaction = (
  categoryId: string,
  value: number,
  type: TransactionType,
  date: Date,
) => ({
  date,
  value,
  account: "checking",
  category: { _id: categoryId, name: "Cat", icon: "icon", createdAt: new Date(), updatedAt: new Date() },
  type,
  description: "",
});

describe("BudgetGetter", () => {
  let budgetRepo: InMemoryBudgetRepository;
  let txRepo: InMemoryTransactionRepository;
  let getter: BudgetGetter;

  beforeEach(() => {
    budgetRepo = new InMemoryBudgetRepository();
    txRepo = new InMemoryTransactionRepository();
    getter = new BudgetGetter(budgetRepo, txRepo as unknown as TransactionRepository);
  });

  test("totalSpent is sum of expense transactions in the month", async () => {
    await budgetRepo.upsert(USER_ID, YEAR, MONTH, 1000, []);
    const inMonth = new Date(YEAR, MONTH - 1, 15);
    await txRepo.createTransaction(makeTransaction("cat-1", 200, TransactionType.expenses, inMonth));
    await txRepo.createTransaction(makeTransaction("cat-1", 150, TransactionType.expenses, inMonth));
    await txRepo.createTransaction(makeTransaction("cat-1", 300, TransactionType.income, inMonth));

    const status = await getter.execute(USER_ID, YEAR, MONTH);

    expect(status.totalSpent).toBe(350);
  });

  test("totalRemaining = total - totalSpent (can be negative)", async () => {
    await budgetRepo.upsert(USER_ID, YEAR, MONTH, 300, []);
    const inMonth = new Date(YEAR, MONTH - 1, 10);
    await txRepo.createTransaction(makeTransaction("cat-1", 400, TransactionType.expenses, inMonth));

    const status = await getter.execute(USER_ID, YEAR, MONTH);

    expect(status.totalRemaining).toBe(-100);
    expect(status.isOverBudget).toBe(true);
  });

  test("isOverBudget is false when under budget", async () => {
    await budgetRepo.upsert(USER_ID, YEAR, MONTH, 500, []);
    const inMonth = new Date(YEAR, MONTH - 1, 10);
    await txRepo.createTransaction(makeTransaction("cat-1", 200, TransactionType.expenses, inMonth));

    const status = await getter.execute(USER_ID, YEAR, MONTH);

    expect(status.isOverBudget).toBe(false);
  });

  test("per-category spent and remaining computed correctly", async () => {
    await budgetRepo.upsert(USER_ID, YEAR, MONTH, 1000, [
      { categoryId: "cat-1", allocated: 400 },
    ]);
    const inMonth = new Date(YEAR, MONTH - 1, 10);
    await txRepo.createTransaction(makeTransaction("cat-1", 250, TransactionType.expenses, inMonth));

    const status = await getter.execute(USER_ID, YEAR, MONTH);

    const catStatus = status.categories.find((c) => c.categoryId === "cat-1");
    expect(catStatus?.spent).toBe(250);
    expect(catStatus?.remaining).toBe(150);
    expect(catStatus?.isOver).toBe(false);
  });

  test("isCopiedFromPrevious when no budget for current month but prev exists", async () => {
    await budgetRepo.upsert(USER_ID, YEAR, MONTH - 1, 800, [
      { categoryId: "cat-2", allocated: 200 },
    ]);

    const status = await getter.execute(USER_ID, YEAR, MONTH);

    expect(status.budget?.isCopiedFromPrevious).toBe(true);
    expect(status.budget?.total).toBe(800);
  });

  test("budget is null when no budget history exists", async () => {
    const status = await getter.execute(USER_ID, YEAR, MONTH);

    expect(status.budget).toBeNull();
    expect(status.totalSpent).toBe(0);
    expect(status.totalRemaining).toBe(0);
    expect(status.isOverBudget).toBe(false);
  });

  test("ignores transactions outside the month", async () => {
    await budgetRepo.upsert(USER_ID, YEAR, MONTH, 1000, []);
    const outOfMonth = new Date(YEAR, MONTH - 2, 10);
    await txRepo.createTransaction(makeTransaction("cat-1", 999, TransactionType.expenses, outOfMonth));

    const status = await getter.execute(USER_ID, YEAR, MONTH);

    expect(status.totalSpent).toBe(0);
  });
});
