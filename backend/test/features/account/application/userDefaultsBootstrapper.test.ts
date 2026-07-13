import { UserDefaultsBootstrapper } from "../../../../src/features/account/application/userDefaultsBootstrapper";
import { InMemoryAccountRepository } from "../../../../src/features/account/infrastructure/database/InMemoryAccount.repository";
import { inMemoryCategoryRepository } from "../../../../src/features/category/infrastructure/database/inMemoryCategory.repository";
import { DEFAULT_ACCOUNT_NAME } from "../../../../src/features/account/domain/defaultAccount";
import { DEFAULT_CATEGORIES } from "../../../../src/features/category/domain/defaultCategories";

describe("UserDefaultsBootstrapper", () => {
  const build = () => {
    const accountRepository = new InMemoryAccountRepository();
    const categoryRepository = new inMemoryCategoryRepository();
    const bootstrapper = new UserDefaultsBootstrapper(accountRepository, categoryRepository);

    return { accountRepository, categoryRepository, bootstrapper };
  };

  test("first run creates one 'Sin asignar' bank account and the full default category set", async () => {
    const { accountRepository, categoryRepository, bootstrapper } = build();

    const { defaultAccountId } = await bootstrapper.ensureFor("user-1");

    const accounts = await accountRepository.getAllForUser("user-1");
    expect(accounts).toHaveLength(1);
    expect(accounts[0]).toMatchObject({
      name: DEFAULT_ACCOUNT_NAME,
      type: "bank",
      openingBalance: 0,
    });
    expect(defaultAccountId).toBe(accounts[0]._id);

    const categories = await categoryRepository.getAllForUser("user-1");
    expect(categories).toHaveLength(DEFAULT_CATEGORIES.length);
    expect(categories.map((c) => c.name).sort()).toEqual(
      DEFAULT_CATEGORIES.map((c) => c.name).sort(),
    );
  });

  test("second run for the same user creates no duplicates", async () => {
    const { accountRepository, categoryRepository, bootstrapper } = build();

    await bootstrapper.ensureFor("user-1");
    await bootstrapper.ensureFor("user-1");

    const accounts = await accountRepository.getAllForUser("user-1");
    expect(accounts).toHaveLength(1);

    const categories = await categoryRepository.getAllForUser("user-1");
    expect(categories).toHaveLength(DEFAULT_CATEGORIES.length);
  });

  test("two different users each get their own separate defaults", async () => {
    const { accountRepository, categoryRepository, bootstrapper } = build();

    const resultA = await bootstrapper.ensureFor("user-a");
    const resultB = await bootstrapper.ensureFor("user-b");

    expect(resultA.defaultAccountId).not.toBe(resultB.defaultAccountId);

    const accountsA = await accountRepository.getAllForUser("user-a");
    const accountsB = await accountRepository.getAllForUser("user-b");
    expect(accountsA).toHaveLength(1);
    expect(accountsB).toHaveLength(1);

    const categoriesA = await categoryRepository.getAllForUser("user-a");
    const categoriesB = await categoryRepository.getAllForUser("user-b");
    expect(categoriesA).toHaveLength(DEFAULT_CATEGORIES.length);
    expect(categoriesB).toHaveLength(DEFAULT_CATEGORIES.length);
  });
});
