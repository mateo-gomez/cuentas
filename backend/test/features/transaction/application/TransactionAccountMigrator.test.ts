import { TransactionAccountMigrator } from "../../../../src/features/transaction/application/useCases/TransactionAccountMigrator";
import { InMemoryTransactionRepository } from "../../../../src/features/transaction/infrastructure/database/InMemoryTransaction.repository";
import { inMemoryCategoryRepository } from "../../../../src/features/category/infrastructure/database/inMemoryCategory.repository";
import { TransactionType } from "../../../../src/domain/valueObjects/transactionType.valueObject";

describe("TransactionAccountMigrator", () => {
  const build = () => {
    const transactionRepository = new InMemoryTransactionRepository();
    const categoryRepository = new inMemoryCategoryRepository();
    const migrator = new TransactionAccountMigrator(transactionRepository, categoryRepository);

    return { transactionRepository, categoryRepository, migrator };
  };

  test("reassigns a legacy transaction with account:'' to the owner's default account and backfills userId", async () => {
    const { transactionRepository, migrator } = build();
    const legacy = await transactionRepository.createTransaction({
      account: "",
      date: new Date(),
      value: 10,
      type: TransactionType.expenses,
      description: "legacy",
      category: { _id: "cat-1" } as any,
    } as any);

    await migrator.migrateForUser("user-1", "default-account-1");

    const migrated = await transactionRepository.findOne("user-1", legacy._id);
    expect(migrated).toMatchObject({ userId: "user-1", accountId: "default-account-1" });
  });

  test("reassigns a legacy transaction with no account field at all", async () => {
    const { transactionRepository, migrator } = build();
    const legacy = await transactionRepository.createTransaction({
      date: new Date(),
      value: 10,
      type: TransactionType.expenses,
      description: "legacy no account field",
      category: { _id: "cat-1" } as any,
    } as any);

    await migrator.migrateForUser("user-1", "default-account-1");

    const migrated = await transactionRepository.findOne("user-1", legacy._id);
    expect(migrated).toMatchObject({ userId: "user-1", accountId: "default-account-1" });
  });

  test("leaves an already-linked transaction unchanged", async () => {
    const { transactionRepository, migrator } = build();
    const linked = await transactionRepository.createTransaction({
      userId: "user-2",
      accountId: "real-account-2",
      date: new Date(),
      value: 20,
      type: TransactionType.income,
      description: "already linked",
      category: { _id: "cat-1" } as any,
    } as any);

    await migrator.migrateForUser("user-1", "default-account-1");

    const untouched = await transactionRepository.findOne("user-2", linked._id);
    expect(untouched).toMatchObject({ userId: "user-2", accountId: "real-account-2" });
  });

  test("re-owns ownerless categories to the migrating user without deleting them", async () => {
    const { categoryRepository, migrator } = build();
    const ownerless = await categoryRepository.createCategory("", "Legacy Cat", "help-circle-outline");
    // Simulate a truly ownerless legacy doc (no userId at all).
    (ownerless as any).userId = undefined;

    await migrator.migrateForUser("user-1", "default-account-1");

    const categories = await categoryRepository.getAllForUser("user-1");
    expect(categories.map((c) => c._id)).toContain(ownerless._id);
  });

  test("is idempotent — running twice performs no further changes", async () => {
    const { transactionRepository, migrator } = build();
    const legacy = await transactionRepository.createTransaction({
      account: "",
      date: new Date(),
      value: 10,
      type: TransactionType.expenses,
      description: "legacy",
      category: { _id: "cat-1" } as any,
    } as any);

    await migrator.migrateForUser("user-1", "default-account-1");
    await migrator.migrateForUser("user-2", "default-account-2");

    const migrated = await transactionRepository.findOne("user-1", legacy._id);
    expect(migrated).toMatchObject({ userId: "user-1", accountId: "default-account-1" });
  });
});
