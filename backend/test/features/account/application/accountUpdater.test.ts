import { AccountCreator } from "../../../../src/features/account/application/accountCreator";
import { AccountUpdater } from "../../../../src/features/account/application/accountUpdater";
import { InMemoryAccountRepository } from "../../../../src/features/account/infrastructure/database/InMemoryAccount.repository";
import { ValidationError } from "../../../../src/infrastructure/api/errors/validationError";
import { NotFoundError } from "../../../../src/application/errors/notFoundError";

describe("AccountUpdater", () => {
	test("updates name/openingBalance for the owner", async () => {
		const repository = new InMemoryAccountRepository();
		const creator = new AccountCreator(repository);
		const updater = new AccountUpdater(repository);
		const created = await creator.execute("user-1", {
			name: "Checking",
			type: "bank",
			openingBalance: 100,
		});

		const updated = await updater.execute("user-1", created._id, {
			name: "Savings",
			openingBalance: 200,
		});

		expect(updated).toMatchObject({ name: "Savings", openingBalance: 200 });
	});

	test("rejects switching to credit without cutoffDay/dueDay", async () => {
		const repository = new InMemoryAccountRepository();
		const creator = new AccountCreator(repository);
		const updater = new AccountUpdater(repository);
		const created = await creator.execute("user-1", {
			name: "Checking",
			type: "bank",
			openingBalance: 100,
		});

		await expect(
			updater.execute("user-1", created._id, { type: "credit" }),
		).rejects.toThrow(ValidationError);
	});

	test("throws NotFoundError when another user's account id is used", async () => {
		const repository = new InMemoryAccountRepository();
		const creator = new AccountCreator(repository);
		const updater = new AccountUpdater(repository);
		const created = await creator.execute("user-1", {
			name: "Checking",
			type: "bank",
			openingBalance: 100,
		});

		await expect(
			updater.execute("user-2", created._id, { name: "Hijacked" }),
		).rejects.toThrow(NotFoundError);
	});
});
