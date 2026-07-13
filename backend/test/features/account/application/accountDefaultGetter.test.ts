import { AccountDefaultGetter } from "../../../../src/features/account/application/accountDefaultGetter";
import { AccountCreator } from "../../../../src/features/account/application/accountCreator";
import { InMemoryAccountRepository } from "../../../../src/features/account/infrastructure/database/InMemoryAccount.repository";
import { DEFAULT_ACCOUNT_NAME } from "../../../../src/features/account/domain/defaultAccount";

describe("AccountDefaultGetter", () => {
  const build = () => {
    const repository = new InMemoryAccountRepository();
    const creator = new AccountCreator(repository);
    const getter = new AccountDefaultGetter(repository);
    return { repository, creator, getter };
  };

  test("returns the user's default account when it exists", async () => {
    const { creator, getter } = build();
    const defaultAccount = await creator.execute("user-1", {
      name: DEFAULT_ACCOUNT_NAME,
      type: "bank",
      openingBalance: 0,
    });
    await creator.execute("user-1", {
      name: "Savings",
      type: "bank",
      openingBalance: 0,
    });

    const result = await getter.execute("user-1");

    expect(result?._id).toBe(defaultAccount._id);
  });

  test("returns null when the user has no default account", async () => {
    const { creator, getter } = build();
    await creator.execute("user-1", {
      name: "Savings",
      type: "bank",
      openingBalance: 0,
    });

    expect(await getter.execute("user-1")).toBeNull();
  });

  test("does not leak another user's default account", async () => {
    const { creator, getter } = build();
    await creator.execute("user-2", {
      name: DEFAULT_ACCOUNT_NAME,
      type: "bank",
      openingBalance: 0,
    });

    expect(await getter.execute("user-1")).toBeNull();
  });
});
