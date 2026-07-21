import { AccountCreator } from "../../../../src/features/account/application/accountCreator";
import { AccountRemover } from "../../../../src/features/account/application/accountRemover";
import { InMemoryAccountRepository } from "../../../../src/features/account/infrastructure/database/InMemoryAccount.repository";
import { InMemoryTransactionRepository } from "../../../../src/features/transaction/infrastructure/database/InMemoryTransaction.repository";
import { DEFAULT_ACCOUNT_NAME } from "../../../../src/features/account/domain/defaultAccount";
import { ValidationError } from "../../../../src/infrastructure/api/errors/validationError";
import { NotFoundError } from "../../../../src/application/errors/notFoundError";
import { TransactionType } from "../../../../src/domain/valueObjects/transactionType.valueObject";

describe("AccountRemover", () => {
	test("deletes an owned account with no transactions", async () => {
		const accountRepository = new InMemoryAccountRepository();
		const transactionRepository = new InMemoryTransactionRepository();
		const creator = new AccountCreator(accountRepository);
		const remover = new AccountRemover(accountRepository, transactionRepository);
		const account = await creator.execute("user-1", {
			name: "Checking",
			type: "bank",
			openingBalance: 0,
		});

		await remover.execute("user-1", account._id);

		expect(await accountRepository.getByIdForUser("user-1", account._id)).toBeNull();
	});

	test("blocks deleting the default 'Sin asignar' account", async () => {
		const accountRepository = new InMemoryAccountRepository();
		const transactionRepository = new InMemoryTransactionRepository();
		const creator = new AccountCreator(accountRepository);
		const remover = new AccountRemover(accountRepository, transactionRepository);
		const account = await creator.execute("user-1", {
			name: DEFAULT_ACCOUNT_NAME,
			type: "bank",
			openingBalance: 0,
		});

		await expect(remover.execute("user-1", account._id)).rejects.toThrow(ValidationError);
	});

	test("cascade-deletes the account's transactions when removing it", async () => {
		const accountRepository = new InMemoryAccountRepository();
		const transactionRepository = new InMemoryTransactionRepository();
		const creator = new AccountCreator(accountRepository);
		const remover = new AccountRemover(accountRepository, transactionRepository);
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
			category: { _id: "cat-1", userId: "user-1", name: "Cat", icon: "icon", createdAt: new Date(), updatedAt: new Date() },
			type: TransactionType.income,
			description: "",
		});

		await remover.execute("user-1", account._id);

		expect(await accountRepository.getByIdForUser("user-1", account._id)).toBeNull();
		expect(await transactionRepository.existsForAccount(account._id)).toBe(false);
	});

	test("throws NotFoundError for a non-owned account", async () => {
		const accountRepository = new InMemoryAccountRepository();
		const transactionRepository = new InMemoryTransactionRepository();
		const creator = new AccountCreator(accountRepository);
		const remover = new AccountRemover(accountRepository, transactionRepository);
		const account = await creator.execute("user-1", {
			name: "Checking",
			type: "bank",
			openingBalance: 0,
		});

		await expect(remover.execute("user-2", account._id)).rejects.toThrow(NotFoundError);
	});
});
