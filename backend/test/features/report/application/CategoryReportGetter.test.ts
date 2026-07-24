import { TransactionRepository } from "../../../../src/features/transaction/domain/Transaction.repository";
import { Transaction } from "../../../../src/features/transaction/domain/transaction.entity";
import { TransactionType } from "../../../../src/domain/valueObjects/transactionType.valueObject";
import { CategoryReportGetter } from "../../../../src/features/report/application/useCases/CategoryReportGetter";

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
    date: new Date("2024-01-01"),
    value: 0,
    category: cat("A"),
    type: TransactionType.expenses,
    description: "",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...partial,
  }) as Transaction;

class MockRepo implements Partial<TransactionRepository> {
  constructor(private readonly transactions: Transaction[]) {}
  getBetweenDates = (): Promise<Transaction[]> =>
    Promise.resolve(this.transactions);
}

const build = (transactions: Transaction[]) =>
  new CategoryReportGetter(
    new MockRepo(transactions) as unknown as TransactionRepository,
  );

const start = new Date("2024-01-01");
const end = new Date("2024-01-31");

test("aggregates expenses by category, ranked by total, with shares", async () => {
  const getter = build([
    tx({ category: cat("Food"), value: 100 }),
    tx({ category: cat("Food"), value: 50 }),
    tx({ category: cat("Rent"), value: 300 }),
  ]);

  const report = await getter.execute("user-1", start, end);

  expect(report.grandTotal).toBe(450);
  expect(report.top?.categoryId).toBe("Rent");
  expect(report.items.map((i) => i.categoryId)).toEqual(["Rent", "Food"]);
  expect(report.items[0]).toMatchObject({ total: 300, count: 1, share: 0.6667 });
  expect(report.items[1]).toMatchObject({
    total: 150,
    count: 2,
    share: 0.3333,
  });
});

test("excludes transfer legs and the opposite side", async () => {
  const getter = build([
    tx({ category: cat("Food"), value: 100 }),
    tx({ category: cat("Card"), value: 500, isTransfer: true }),
    tx({ category: cat("Salary"), value: 999, type: TransactionType.income }),
  ]);

  const report = await getter.execute("user-1", start, end);

  expect(report.grandTotal).toBe(100);
  expect(report.items).toHaveLength(1);
  expect(report.items[0].categoryId).toBe("Food");
});

test("aggregates the income side when requested", async () => {
  const getter = build([
    tx({ category: cat("Salary"), value: 1000, type: TransactionType.income }),
    tx({ category: cat("Food"), value: 100 }),
  ]);

  const report = await getter.execute(
    "user-1",
    start,
    end,
    TransactionType.income,
  );

  expect(report.type).toBe(TransactionType.income);
  expect(report.grandTotal).toBe(1000);
  expect(report.top?.categoryId).toBe("Salary");
});

test("dedupes categories whose _id is an ObjectId object, not a string", async () => {
  // The repo populates category without mapping, so at runtime category._id is
  // a Mongoose ObjectId. Two transactions of the same category carry distinct
  // ObjectId instances that share the same hex. Simulate that: each tx gets a
  // fresh object with the same toString() so a reference-keyed Map would split
  // them into two rows (the duplicate-React-key bug).
  const hex = "6a53ed12b9fd547ec972256d";
  const oid = () => ({ toString: () => hex }) as unknown as string;
  const catObj = () => ({
    _id: oid(),
    name: "Food",
    icon: "food",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  });

  const getter = build([
    tx({ category: catObj(), value: 100 }),
    tx({ category: catObj(), value: 50 }),
  ]);

  const report = await getter.execute("user-1", start, end);

  expect(report.items).toHaveLength(1);
  expect(report.items[0]).toMatchObject({ categoryId: hex, total: 150, count: 2 });
});

test("returns an empty report with null top when there is no data", async () => {
  const report = await build([]).execute("user-1", start, end);

  expect(report).toEqual({
    type: TransactionType.expenses,
    grandTotal: 0,
    top: null,
    items: [],
  });
});
