import { AccountBalanceGetter } from "../../../../src/features/account/application/accountBalanceGetter";
import { AccountCreator } from "../../../../src/features/account/application/accountCreator";
import { InMemoryAccountRepository } from "../../../../src/features/account/infrastructure/database/InMemoryAccount.repository";
import { InMemoryTransactionRepository } from "../../../../src/features/transaction/infrastructure/database/InMemoryTransaction.repository";
import { TransactionType } from "../../../../src/domain/valueObjects/transactionType.valueObject";

const buildCategory = () => ({
	_id: "cat-1",
	name: "Cat",
	icon: "icon",
	createdAt: new Date(),
	updatedAt: new Date(),
});

describe("AccountBalanceGetter", () => {
	test("returns null when the account does not exist for the user", async () => {
		const accountRepository = new InMemoryAccountRepository();
		const transactionRepository = new InMemoryTransactionRepository();
		const getter = new AccountBalanceGetter(accountRepository, transactionRepository);

		const balance = await getter.execute("user-1", "missing-account");

		expect(balance).toBeNull();
	});

	test("balance = openingBalance when the account has no transactions", async () => {
		const accountRepository = new InMemoryAccountRepository();
		const transactionRepository = new InMemoryTransactionRepository();
		const accountCreator = new AccountCreator(accountRepository);
		const account = await accountCreator.execute("user-1", {
			name: "Checking",
			type: "bank",
			openingBalance: 1000,
		});
		const getter = new AccountBalanceGetter(accountRepository, transactionRepository);

		const balance = await getter.execute("user-1", account._id);

		expect(balance).toMatchObject({
			accountId: account._id,
			openingBalance: 1000,
			balance: 1000,
		});
	});

	test("balance = openingBalance + income - expense for that account only", async () => {
		const accountRepository = new InMemoryAccountRepository();
		const transactionRepository = new InMemoryTransactionRepository();
		const accountCreator = new AccountCreator(accountRepository);
		const accountA = await accountCreator.execute("user-1", {
			name: "A",
			type: "bank",
			openingBalance: 1000,
		});
		const accountB = await accountCreator.execute("user-1", {
			name: "B",
			type: "bank",
			openingBalance: 500,
		});

		await transactionRepository.createTransaction({
			date: new Date(),
			value: 500,
			userId: "user-1",
			accountId: accountA._id,
			category: buildCategory(),
			type: TransactionType.income,
			description: "income",
		});
		await transactionRepository.createTransaction({
			date: new Date(),
			value: 200,
			userId: "user-1",
			accountId: accountA._id,
			category: buildCategory(),
			type: TransactionType.expenses,
			description: "expense",
		});

		const getter = new AccountBalanceGetter(accountRepository, transactionRepository);

		const balanceA = await getter.execute("user-1", accountA._id);
		const balanceB = await getter.execute("user-1", accountB._id);

		expect(balanceA).toMatchObject({ balance: 1300 });
		// account B is unaffected by account A's transactions
		expect(balanceB).toMatchObject({ balance: 500 });
	});
});
