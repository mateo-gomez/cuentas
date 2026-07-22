import { TransactionController } from "../../../../../src/features/transaction/infrastructure/api/transaction.controller";
import { TransactionCreator } from "../../../../../src/features/transaction/application/useCases/transactionCreator";
import { TransactionByIdGetter } from "../../../../../src/features/transaction/application/useCases/TransactionByIdGetter";
import { TransactionUpdater } from "../../../../../src/features/transaction/application/useCases/transactionUpdater";
import { TransactionRemover } from "../../../../../src/features/transaction/application/useCases/transactionRemover";
import { TransactionsRemover } from "../../../../../src/features/transaction/application/useCases/transactionsRemover";
import { InMemoryTransactionRepository } from "../../../../../src/features/transaction/infrastructure/database/InMemoryTransaction.repository";
import { AccountCreator } from "../../../../../src/features/account/application/accountCreator";
import { AccountByIdGetter } from "../../../../../src/features/account/application/accountByIdGetter";
import { InMemoryAccountRepository } from "../../../../../src/features/account/infrastructure/database/InMemoryAccount.repository";
import { TransactionType } from "../../../../../src/domain/valueObjects/transactionType.valueObject";
import { RequestAuthenticated } from "../../../../../src/infrastructure/api/middlewares/BaseMiddleware";
import mongoose from "mongoose";

// Minimal helper: catchAsync fires the handler and forwards rejections to
// `next` without returning the underlying promise, so tests await a small
// deferred that resolves on `res.json` and rejects on `next(error)`.
const invoke = (
	handler: (req: any, res: any, next: any) => void,
	req: Partial<RequestAuthenticated>,
): Promise<{ statusCode: number; body: any }> => {
	return new Promise((resolve, reject) => {
		const res: any = {
			status: (statusCode: number) => ({
				json: (body: any) => resolve({ statusCode, body }),
			}),
		};
		const next = (error: unknown) => reject(error);
		handler(req as RequestAuthenticated, res, next);
	});
};

// A well-formed category id that belongs to the caller (existsForUser stub
// below returns true), so the create-success path clears category validation.
const OWNED_CATEGORY_ID = new mongoose.Types.ObjectId().toString();

const buildController = () => {
	const transactionRepository = new InMemoryTransactionRepository();
	const accountRepository = new InMemoryAccountRepository();
	const accountCreator = new AccountCreator(accountRepository);
	const accountByIdGetter = new AccountByIdGetter(accountRepository);
	const transactionCreator = new TransactionCreator(transactionRepository);
	const categoryRepository = { existsForUser: async () => true } as any;

	const controller = new TransactionController(
		{ execute: async () => null } as any,
		transactionCreator,
		{ execute: async () => ({ transferId: "t-1" }) } as any, // createTransfer
		{ execute: async () => { throw new Error("not used"); } } as any,
		{ execute: async () => {} } as any,
		{ execute: async () => 0 } as any,
		{ execute: async () => 0 } as any, // transactionsCategoryUpdater
		{ execute: async () => 0 } as any, // allTransactionsRemover
		{ execute: async () => {} } as any,
		{} as any,
		{} as any,
		accountByIdGetter,
		accountRepository,
		{ execute: async () => [] } as any,
		categoryRepository,
	);

	return { controller, accountCreator, transactionRepository };
};

describe("TransactionController — accountId ownership validation", () => {
	test("rejects create when accountId is omitted", async () => {
		const { controller } = buildController();

		await expect(
			invoke(controller.saveTransaction, {
				user: { id: "user-1" },
				body: { category: "cat-1", date: new Date(), description: "x", type: TransactionType.expenses, value: 10 },
			}),
		).rejects.toThrow();
	});

	test("rejects create when accountId belongs to another user", async () => {
		const { controller, accountCreator } = buildController();
		const account = await accountCreator.execute("user-2", {
			name: "Checking",
			type: "bank",
			openingBalance: 0,
		});

		await expect(
			invoke(controller.saveTransaction, {
				user: { id: "user-1" },
				body: {
					category: "cat-1",
					date: new Date(),
					description: "x",
					type: TransactionType.expenses,
					value: 10,
					accountId: account._id,
				},
			}),
		).rejects.toThrow();
	});

	test("creates the transaction with the caller's userId + owned accountId", async () => {
		const { controller, accountCreator } = buildController();
		const account = await accountCreator.execute("user-1", {
			name: "Checking",
			type: "bank",
			openingBalance: 0,
		});

		const { statusCode, body } = await invoke(controller.saveTransaction, {
			user: { id: "user-1" },
			body: {
				category: OWNED_CATEGORY_ID,
				date: new Date(),
				description: "x",
				type: TransactionType.expenses,
				value: 10,
				accountId: account._id,
			},
		});

		expect(statusCode).toBeLessThan(300);
		expect(body.data).toMatchObject({ userId: "user-1", accountId: account._id });
	});
});

describe("TransactionController — category ownership validation", () => {
	const buildWithCategoryStub = (existsForUser: (u: string, id: string) => Promise<boolean>) => {
		const transactionRepository = new InMemoryTransactionRepository();
		const accountRepository = new InMemoryAccountRepository();
		const accountCreator = new AccountCreator(accountRepository);
		const accountByIdGetter = new AccountByIdGetter(accountRepository);
		const transactionCreator = new TransactionCreator(transactionRepository);

		const controller = new TransactionController(
			{ execute: async () => null } as any,
			transactionCreator,
			{ execute: async () => ({ transferId: "t-1" }) } as any, // createTransfer
			{ execute: async () => { throw new Error("not used"); } } as any,
			{ execute: async () => {} } as any,
			{ execute: async () => 0 } as any,
			{ execute: async () => 0 } as any, // transactionsCategoryUpdater
		{ execute: async () => 0 } as any, // allTransactionsRemover
			{ execute: async () => {} } as any,
			{} as any,
			{} as any,
			accountByIdGetter,
			accountRepository,
			{ execute: async () => [] } as any,
			{ existsForUser } as any,
		);

		return { controller, accountCreator };
	};

	test("rejects a malformed category id before it reaches the repository", async () => {
		const { controller, accountCreator } = buildWithCategoryStub(async () => true);
		const account = await accountCreator.execute("user-1", {
			name: "Checking", type: "bank", openingBalance: 0,
		});

		await expect(
			invoke(controller.saveTransaction, {
				user: { id: "user-1" },
				body: {
					category: "not-an-object-id",
					date: new Date(), description: "x", type: TransactionType.expenses,
					value: 10, accountId: account._id,
				},
			}),
		).rejects.toThrow();
	});

	test("rejects a well-formed category id that does not belong to the caller", async () => {
		const { controller, accountCreator } = buildWithCategoryStub(async () => false);
		const account = await accountCreator.execute("user-1", {
			name: "Checking", type: "bank", openingBalance: 0,
		});

		await expect(
			invoke(controller.saveTransaction, {
				user: { id: "user-1" },
				body: {
					category: new mongoose.Types.ObjectId().toString(),
					date: new Date(), description: "x", type: TransactionType.expenses,
					value: 10, accountId: account._id,
				},
			}),
		).rejects.toThrow();
	});

	test("allows an omitted category (creates with no category)", async () => {
		const existsForUser = jest.fn(async () => false);
		const { controller, accountCreator } = buildWithCategoryStub(existsForUser);
		const account = await accountCreator.execute("user-1", {
			name: "Checking", type: "bank", openingBalance: 0,
		});

		const { statusCode, body } = await invoke(controller.saveTransaction, {
			user: { id: "user-1" },
			body: {
				date: new Date(), description: "x", type: TransactionType.expenses,
				value: 10, accountId: account._id,
			},
		});

		expect(statusCode).toBeLessThan(300);
		expect(body.data.category).toBeUndefined();
		// No category supplied → ownership check is skipped entirely.
		expect(existsForUser).not.toHaveBeenCalled();
	});
});

describe("TransactionController — userId scoping (IDOR)", () => {
	const buildScopedController = async () => {
		const transactionRepository = new InMemoryTransactionRepository();
		const accountRepository = new InMemoryAccountRepository();
		const accountCreator = new AccountCreator(accountRepository);
		const accountByIdGetter = new AccountByIdGetter(accountRepository);
		const transactionCreator = new TransactionCreator(transactionRepository);
		const transactionByIdGetter = new TransactionByIdGetter(transactionRepository);
		const transactionUpdater = new TransactionUpdater(transactionRepository);
		const transactionRemover = new TransactionRemover(transactionRepository);
		const transactionsRemover = new TransactionsRemover(transactionRepository);

		const ownerAccount = await accountCreator.execute("owner", {
			name: "Owner Checking",
			type: "bank",
			openingBalance: 0,
		});

		const controller = new TransactionController(
			transactionByIdGetter,
			transactionCreator,
			{ execute: async () => ({ transferId: "t-1" }) } as any, // createTransfer
			transactionUpdater,
			transactionRemover,
			transactionsRemover,
			{ execute: async () => 0 } as any, // transactionsCategoryUpdater
		{ execute: async () => 0 } as any, // allTransactionsRemover
			{ execute: async () => {} } as any,
			{} as any,
			{} as any,
			accountByIdGetter,
			accountRepository,
			{ execute: async () => [] } as any,
			{ existsForUser: async () => true } as any,
		);

		const createdTransaction = await transactionCreator.execute({
			category: "cat-1",
			date: new Date(),
			description: "owner's transaction",
			type: TransactionType.expenses,
			account: "",
			userId: "owner",
			accountId: ownerAccount._id,
			value: 42,
		});

		// isIdValid requires a mongoose-ObjectId-shaped id; the in-memory repo
		// generates a short random id, so swap it for a valid one directly in
		// the repository's internal store.
		const validId = new mongoose.Types.ObjectId().toString();
		(transactionRepository as any).transactions = (
			transactionRepository as any
		).transactions.map((transaction: any) =>
			transaction._id === createdTransaction._id
				? { ...transaction, _id: validId }
				: transaction,
		);
		const ownerTransaction = { ...createdTransaction, _id: validId };

		return { controller, transactionRepository, ownerTransaction };
	};

	test("GET by another user's id returns not-found instead of leaking the transaction", async () => {
		const { controller, ownerTransaction } = await buildScopedController();

		await expect(
			invoke(controller.getTransaction, {
				user: { id: "attacker" },
				params: { id: ownerTransaction._id },
			}),
		).rejects.toThrow();
	});

	test("GET by the owner's id still works", async () => {
		const { controller, ownerTransaction } = await buildScopedController();

		const { statusCode, body } = await invoke(controller.getTransaction, {
			user: { id: "owner" },
			params: { id: ownerTransaction._id },
		});

		expect(statusCode).toBeLessThan(300);
		expect(body.data._id).toBe(ownerTransaction._id);
	});

	test("PUT by another user's id does not modify the transaction", async () => {
		const { controller, ownerTransaction, transactionRepository } =
			await buildScopedController();

		await expect(
			invoke(controller.updateTransaction, {
				user: { id: "attacker" },
				params: { id: ownerTransaction._id },
				body: {
					category: "cat-1",
					date: new Date(),
					description: "tampered",
					type: TransactionType.expenses,
					value: 999,
					accountId: ownerTransaction.accountId,
				},
			}),
		).rejects.toThrow();

		const stillOwned = await transactionRepository.findOne("owner", ownerTransaction._id);
		expect(stillOwned?.description).toBe("owner's transaction");
	});

	test("DELETE by another user's id does not delete the transaction", async () => {
		const { controller, ownerTransaction, transactionRepository } =
			await buildScopedController();

		await expect(
			invoke(controller.deleteTransaction, {
				user: { id: "attacker" },
				params: { id: ownerTransaction._id },
			}),
		).rejects.toThrow();

		expect(await transactionRepository.exists("owner", ownerTransaction._id)).toBe(true);
	});

	test("bulk DELETE by another user's ids does not delete the transaction", async () => {
		const { controller, ownerTransaction, transactionRepository } =
			await buildScopedController();

		const { statusCode, body } = await invoke(controller.deleteTransactions, {
			user: { id: "attacker" },
			body: { ids: [ownerTransaction._id] },
		});

		expect(statusCode).toBeLessThan(300);
		expect(body.data.deletedCount).toBe(0);
		expect(await transactionRepository.exists("owner", ownerTransaction._id)).toBe(true);
	});

	test("DELETE by the owner still works", async () => {
		const { controller, ownerTransaction, transactionRepository } =
			await buildScopedController();

		await invoke(controller.deleteTransaction, {
			user: { id: "owner" },
			params: { id: ownerTransaction._id },
		});

		expect(await transactionRepository.exists("owner", ownerTransaction._id)).toBe(false);
	});
});

describe("TransactionController — getFrequent", () => {
	test("returns an empty array when there is no history, never crashes", async () => {
		const { controller } = buildController();

		const { statusCode, body } = await invoke(controller.getFrequent, {
			user: { id: "user-1" },
			query: {},
		});

		expect(statusCode).toBeLessThan(300);
		expect(body.data).toEqual([]);
	});

	test("delegates userId, accountId, and limit to the use case", async () => {
		const transactionRepository = new InMemoryTransactionRepository();
		const accountRepository = new InMemoryAccountRepository();
		const accountByIdGetter = new AccountByIdGetter(accountRepository);
		const frequentCombosGetter = {
			execute: jest.fn().mockResolvedValue([]),
		};

		const controller = new TransactionController(
			{ execute: async () => null } as any,
			{ execute: async () => {} } as any,
			{ execute: async () => ({ transferId: "t-1" }) } as any, // createTransfer
			{ execute: async () => { throw new Error("not used"); } } as any,
			{ execute: async () => {} } as any,
			{ execute: async () => 0 } as any,
			{ execute: async () => 0 } as any, // transactionsCategoryUpdater
		{ execute: async () => 0 } as any, // allTransactionsRemover
			{ execute: async () => {} } as any,
			{} as any,
			{} as any,
			accountByIdGetter,
			accountRepository,
			frequentCombosGetter as any,
			{ existsForUser: async () => true } as any,
		);

		const accountId = new mongoose.Types.ObjectId().toString();

		await invoke(controller.getFrequent, {
			user: { id: "user-1" },
			query: { accountId, limit: "3" },
		});

		expect(frequentCombosGetter.execute).toHaveBeenCalledWith(
			"user-1",
			accountId,
			3,
		);
	});

	test("rejects malformed accountId with a validation error", async () => {
		const { controller } = buildController();

		await expect(
			invoke(controller.getFrequent, {
				user: { id: "user-1" },
				query: { accountId: "not-an-object-id" },
			}),
		).rejects.toThrow();
	});

	test("rejects non-numeric limit with a validation error", async () => {
		const { controller } = buildController();

		await expect(
			invoke(controller.getFrequent, {
				user: { id: "user-1" },
				query: { limit: "abc" },
			}),
		).rejects.toThrow();
	});

	test("rejects negative limit with a validation error", async () => {
		const { controller } = buildController();

		await expect(
			invoke(controller.getFrequent, {
				user: { id: "user-1" },
				query: { limit: "-1" },
			}),
		).rejects.toThrow();
	});

	test("clamps a limit above the max to MAX_FREQUENT_LIMIT", async () => {
		const transactionRepository = new InMemoryTransactionRepository();
		const accountRepository = new InMemoryAccountRepository();
		const accountByIdGetter = new AccountByIdGetter(accountRepository);
		const frequentCombosGetter = {
			execute: jest.fn().mockResolvedValue([]),
		};

		const controller = new TransactionController(
			{ execute: async () => null } as any,
			{ execute: async () => {} } as any,
			{ execute: async () => ({ transferId: "t-1" }) } as any, // createTransfer
			{ execute: async () => { throw new Error("not used"); } } as any,
			{ execute: async () => {} } as any,
			{ execute: async () => 0 } as any,
			{ execute: async () => 0 } as any, // transactionsCategoryUpdater
		{ execute: async () => 0 } as any, // allTransactionsRemover
			{ execute: async () => {} } as any,
			{} as any,
			{} as any,
			accountByIdGetter,
			accountRepository,
			frequentCombosGetter as any,
			{ existsForUser: async () => true } as any,
		);

		const { statusCode } = await invoke(controller.getFrequent, {
			user: { id: "user-1" },
			query: { limit: "9999" },
		});

		expect(statusCode).toBeLessThan(300);
		expect(frequentCombosGetter.execute).toHaveBeenCalledWith(
			"user-1",
			undefined,
			20,
		);
	});
});
