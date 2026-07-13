import { AccountCreator } from "../../../../src/features/account/application/accountCreator";
import { InMemoryAccountRepository } from "../../../../src/features/account/infrastructure/database/InMemoryAccount.repository";
import { ValidationError } from "../../../../src/infrastructure/api/errors/validationError";

describe("AccountCreator", () => {
	test("creates a bank account without cutoffDay/dueDay", async () => {
		const repository = new InMemoryAccountRepository();
		const creator = new AccountCreator(repository);

		const account = await creator.execute("user-1", {
			name: "Checking",
			type: "bank",
			openingBalance: 1000,
		});

		expect(account).toMatchObject({ name: "Checking", type: "bank", openingBalance: 1000 });
		expect(account.cutoffDay).toBeUndefined();
		expect(account.dueDay).toBeUndefined();
	});

	test("rejects a credit account missing cutoffDay/dueDay", async () => {
		const repository = new InMemoryAccountRepository();
		const creator = new AccountCreator(repository);

		await expect(
			creator.execute("user-1", { name: "Visa", type: "credit", openingBalance: 0 }),
		).rejects.toThrow(ValidationError);
	});

	test("creates a credit account with cutoffDay/dueDay persisted", async () => {
		const repository = new InMemoryAccountRepository();
		const creator = new AccountCreator(repository);

		const account = await creator.execute("user-1", {
			name: "Visa",
			type: "credit",
			openingBalance: 0,
			cutoffDay: 5,
			dueDay: 20,
		});

		expect(account).toMatchObject({ cutoffDay: 5, dueDay: 20 });
	});
});
