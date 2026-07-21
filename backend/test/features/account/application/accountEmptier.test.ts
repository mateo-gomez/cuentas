import { AccountCreator } from "../../../../src/features/account/application/accountCreator";
import { AccountEmptier } from "../../../../src/features/account/application/accountEmptier";
import { InMemoryAccountRepository } from "../../../../src/features/account/infrastructure/database/InMemoryAccount.repository";
import { InMemoryTransactionRepository } from "../../../../src/features/transaction/infrastructure/database/InMemoryTransaction.repository";
import { NotFoundError } from "../../../../src/application/errors/notFoundError";
import { TransactionType } from "../../../../src/domain/valueObjects/transactionType.valueObject";

const category = {
	_id: "cat-1",
	userId: "user-1",
	name: "Cat",
	icon: "icon",
	createdAt: new Date(),
	updatedAt: new Date(),
};

describe("AccountEmptier", () => {
	const build = () => {
		const accountRepository = new InMemoryAccountRepository();
		const transactionRepository = new InMemoryTransactionRepository();
		const creator = new AccountCreator(accountRepository);
		const emptier = new AccountEmptier(accountRepository, transactionRepository);
		return { accountRepository, transactionRepository, creator, emptier };
	};

	test("wipes the account's transactions but keeps the account", async () => {
		const { creator, transactionRepository, emptier, accountRepository } = build();
		const account = await creator.execute("user-1", {
			name: "Checking",
			type: "bank",
			openingBalance: 0,
		});
		await transactionRepository.createTransaction({
			userId: "user-1",
			accountId: account._id,
			date: new Date(),
			value: 100,
			category,
			type: TransactionType.income,
			description: "",
		});

		const deleted = await emptier.execute("user-1", account._id);

		expect(deleted).toBe(1);
		expect(await transactionRepository.existsForAccount(account._id)).toBe(false);
		expect(
			await accountRepository.getByIdForUser("user-1", account._id),
		).not.toBeNull();
	});

	test("also removes the partner leg of a transfer on the other account", async () => {
		const { creator, transactionRepository, emptier } = build();
		const source = await creator.execute("user-1", {
			name: "Bank",
			type: "bank",
			openingBalance: 0,
		});
		const destination = await creator.execute("user-1", {
			name: "Card",
			type: "credit",
			openingBalance: 0,
			cutoffDay: 1,
			dueDay: 10,
		});

		const transferId = "transfer-1";
		await transactionRepository.createTransaction({
			userId: "user-1",
			accountId: source._id,
			date: new Date(),
			value: 100,
			category,
			type: TransactionType.expense,
			description: "pay card",
			transferId,
			isTransfer: true,
		} as never);
		await transactionRepository.createTransaction({
			userId: "user-1",
			accountId: destination._id,
			date: new Date(),
			value: 100,
			category,
			type: TransactionType.income,
			description: "pay card",
			transferId,
			isTransfer: true,
		} as never);

		await emptier.execute("user-1", source._id);

		// Both legs gone — no dangling transferId left on the destination account.
		expect(await transactionRepository.existsForAccount(source._id)).toBe(false);
		expect(await transactionRepository.existsForAccount(destination._id)).toBe(false);
	});

	test("throws NotFoundError for a non-owned account", async () => {
		const { creator, emptier } = build();
		const account = await creator.execute("user-1", {
			name: "Checking",
			type: "bank",
			openingBalance: 0,
		});

		await expect(emptier.execute("user-2", account._id)).rejects.toThrow(
			NotFoundError,
		);
	});
});
