import { AccountCreator } from "../../../../src/features/account/application/accountCreator";
import { AccountGetter } from "../../../../src/features/account/application/accountGetter";
import { AccountByIdGetter } from "../../../../src/features/account/application/accountByIdGetter";
import { InMemoryAccountRepository } from "../../../../src/features/account/infrastructure/database/InMemoryAccount.repository";

describe("Account ownership scoping", () => {
	test("listing accounts only returns the requesting user's accounts", async () => {
		const repository = new InMemoryAccountRepository();
		const creator = new AccountCreator(repository);
		const getter = new AccountGetter(repository);

		await creator.execute("user-1", { name: "A", type: "bank", openingBalance: 0 });
		await creator.execute("user-2", { name: "B", type: "bank", openingBalance: 0 });

		const userOneAccounts = await getter.execute("user-1");

		expect(userOneAccounts).toHaveLength(1);
		expect(userOneAccounts[0].name).toBe("A");
	});

	test("byId lookup returns null for another user's account", async () => {
		const repository = new InMemoryAccountRepository();
		const creator = new AccountCreator(repository);
		const byIdGetter = new AccountByIdGetter(repository);

		const account = await creator.execute("user-1", {
			name: "A",
			type: "bank",
			openingBalance: 0,
		});

		const result = await byIdGetter.execute("user-2", account._id);

		expect(result).toBeNull();
	});
});
