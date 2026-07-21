import { TransactionRepository } from "../../../../src/features/transaction/domain/Transaction.repository";
import { Transaction } from "../../../../src/features/transaction/domain/transaction.entity";
import { TransactionType } from "../../../../src/domain/valueObjects/transactionType.valueObject";
import { CategoryReportGetter } from "../../../../src/features/report/application/useCases/CategoryReportGetter";
import { CategoryTrendGetter } from "../../../../src/features/report/application/useCases/CategoryTrendGetter";

const cat = (id: string) => ({
  _id: id,
  name: `Category ${id}`,
  icon: `icon${id}`,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
});

const tx = (partial: Partial<Transaction>): Transaction =>
  ({
    _id: Math.random().toString(),
    userId: "user-1",
    accountId: "account-1",
    date: new Date("2024-02-15"),
    value: 0,
    category: cat("A"),
    type: TransactionType.expenses,
    description: "",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...partial,
  }) as Transaction;

// Returns different transactions per date window so current/previous differ.
class RangeAwareRepo implements Partial<TransactionRepository> {
  constructor(
    private readonly current: Transaction[],
    private readonly previous: Transaction[],
    private readonly boundary: Date,
  ) {}
  getBetweenDates = (
    _userId: string,
    startDate: Date,
  ): Promise<Transaction[]> =>
    Promise.resolve(startDate >= this.boundary ? this.current : this.previous);
}

const build = (
  current: Transaction[],
  previous: Transaction[],
  boundary: Date,
) =>
  new CategoryTrendGetter(
    new CategoryReportGetter(
      new RangeAwareRepo(
        current,
        previous,
        boundary,
      ) as unknown as TransactionRepository,
    ),
  );

const curStart = new Date("2024-02-01");
const curEnd = new Date("2024-02-29T23:59:59.999");
const prevStart = new Date("2024-01-01");
const prevEnd = new Date("2024-01-31T23:59:59.999");

test("computes per-category deltas and pct, sorted by absolute delta", async () => {
  const getter = build(
    [
      tx({ category: cat("Food"), value: 150 }),
      tx({ category: cat("Rent"), value: 300 }),
    ],
    [
      tx({ category: cat("Food"), value: 100 }),
      tx({ category: cat("Rent"), value: 300 }),
    ],
    curStart,
  );

  const trend = await getter.execute(
    "user-1",
    curStart,
    curEnd,
    prevStart,
    prevEnd,
  );

  expect(trend.currentTotal).toBe(450);
  expect(trend.previousTotal).toBe(400);
  expect(trend.delta).toBe(50);
  // Food moved +50 (biggest mover), Rent unchanged.
  expect(trend.items[0]).toMatchObject({
    categoryId: "Food",
    current: 150,
    previous: 100,
    delta: 50,
    deltaPct: 0.5,
  });
  expect(trend.items[1]).toMatchObject({ categoryId: "Rent", delta: 0 });
});

test("new category (no baseline) reports null deltaPct", async () => {
  const getter = build(
    [tx({ category: cat("Gym"), value: 80 })],
    [],
    curStart,
  );

  const trend = await getter.execute(
    "user-1",
    curStart,
    curEnd,
    prevStart,
    prevEnd,
  );

  expect(trend.items[0]).toMatchObject({
    categoryId: "Gym",
    current: 80,
    previous: 0,
    delta: 80,
    deltaPct: null,
  });
});

test("category present only in previous period shows a negative delta", async () => {
  const getter = build(
    [],
    [tx({ category: cat("Trips"), value: 500 })],
    curStart,
  );

  const trend = await getter.execute(
    "user-1",
    curStart,
    curEnd,
    prevStart,
    prevEnd,
  );

  expect(trend.items[0]).toMatchObject({
    categoryId: "Trips",
    current: 0,
    previous: 500,
    delta: -500,
    deltaPct: -1,
  });
});
