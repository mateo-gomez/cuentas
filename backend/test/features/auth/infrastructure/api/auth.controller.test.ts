import { AuthController } from "../../../../../src/features/auth/infrastructure/api/auth.controller";
import { AuthSignin } from "../../../../../src/features/auth/application/authSignin";
import { AuthSignup } from "../../../../../src/features/auth/application/authSignup";
import { UserDefaultsBootstrapper } from "../../../../../src/features/account/application/userDefaultsBootstrapper";
import { TransactionAccountMigrator } from "../../../../../src/features/transaction/application/useCases/TransactionAccountMigrator";
import { InMemoryAccountRepository } from "../../../../../src/features/account/infrastructure/database/InMemoryAccount.repository";
import { inMemoryCategoryRepository } from "../../../../../src/features/category/infrastructure/database/inMemoryCategory.repository";
import { InMemoryTransactionRepository } from "../../../../../src/features/transaction/infrastructure/database/InMemoryTransaction.repository";
import { DEFAULT_ACCOUNT_NAME } from "../../../../../src/features/account/domain/defaultAccount";

const invoke = (
	handler: (req: any, res: any, next: any) => void,
	req: any,
): Promise<{ statusCode: number; body: any }> => {
	return new Promise((resolve, reject) => {
		const res: any = {
			status: (statusCode: number) => ({
				json: (body: any) => resolve({ statusCode, body }),
			}),
		};
		const next = (error: unknown) => reject(error);
		handler(req, res, next);
	});
};

describe("AuthController — per-user defaults bootstrap on signin", () => {
	const build = () => {
		const accountRepository = new InMemoryAccountRepository();
		const categoryRepository = new inMemoryCategoryRepository();
		const transactionRepository = new InMemoryTransactionRepository();
		const userDefaultsBootstrapper = new UserDefaultsBootstrapper(
			accountRepository,
			categoryRepository,
		);
		const transactionAccountMigrator = new TransactionAccountMigrator(
			transactionRepository,
			categoryRepository,
		);

		const authSignin = {
			execute: async () => ({
				user: { _id: "user-1", email: "a@a.com" },
				token: "t",
				refreshToken: "r",
			}),
		} as unknown as AuthSignin;

		const controller = new AuthController(
			authSignin,
			{} as AuthSignup,
			{} as any,
			{} as any,
			userDefaultsBootstrapper,
			transactionAccountMigrator,
		);

		return { controller, accountRepository, categoryRepository };
	};

	test("signin provisions the user's default account + categories", async () => {
		const { controller, accountRepository } = build();

		const { statusCode } = await invoke(controller.signin, {
			body: { email: "a@a.com", password: "x" },
		});

		expect(statusCode).toBeLessThan(300);
		const accounts = await accountRepository.getAllForUser("user-1");
		expect(accounts).toHaveLength(1);
		expect(accounts[0].name).toBe(DEFAULT_ACCOUNT_NAME);
	});

	test("second signin for the same user creates no duplicate defaults", async () => {
		const { controller, accountRepository } = build();

		await invoke(controller.signin, { body: { email: "a@a.com", password: "x" } });
		await invoke(controller.signin, { body: { email: "a@a.com", password: "x" } });

		const accounts = await accountRepository.getAllForUser("user-1");
		expect(accounts).toHaveLength(1);
	});

	test("signin rejects invalid credentials without a double response (no send-then-throw)", async () => {
		const { accountRepository, categoryRepository } = build();
		const transactionRepository = new InMemoryTransactionRepository();
		const userDefaultsBootstrapper = new UserDefaultsBootstrapper(
			accountRepository,
			categoryRepository,
		);
		const transactionAccountMigrator = new TransactionAccountMigrator(
			transactionRepository,
			categoryRepository,
		);
		const authSignin = {
			execute: async () => {
				throw new Error("Invalid email or password");
			},
		} as unknown as AuthSignin;
		const controller = new AuthController(
			authSignin,
			{} as AuthSignup,
			{} as any,
			{} as any,
			userDefaultsBootstrapper,
			transactionAccountMigrator,
		);

		await expect(
			invoke(controller.signin, { body: { email: "a@a.com", password: "wrong" } }),
		).rejects.toThrow("Invalid email or password");
	});

	test("a failing defaults bootstrap does not block an otherwise-successful signin", async () => {
		const accountRepository = new InMemoryAccountRepository();
		const categoryRepository = new inMemoryCategoryRepository();
		const transactionRepository = new InMemoryTransactionRepository();
		const userDefaultsBootstrapper = {
			ensureFor: async () => {
				throw new Error("Database unavailable");
			},
		} as unknown as UserDefaultsBootstrapper;
		const transactionAccountMigrator = new TransactionAccountMigrator(
			transactionRepository,
			categoryRepository,
		);
		const authSignin = {
			execute: async () => ({
				user: { _id: "user-1", email: "a@a.com" },
				token: "t",
				refreshToken: "r",
			}),
		} as unknown as AuthSignin;
		const controller = new AuthController(
			authSignin,
			{} as AuthSignup,
			{} as any,
			{} as any,
			userDefaultsBootstrapper,
			transactionAccountMigrator,
		);

		const { statusCode, body } = await invoke(controller.signin, {
			body: { email: "a@a.com", password: "x" },
		});

		expect(statusCode).toBeLessThan(300);
		expect(body.data.token).toBe("t");
	});
});

describe("AuthController — signup provisions defaults", () => {
	const build = () => {
		const accountRepository = new InMemoryAccountRepository();
		const categoryRepository = new inMemoryCategoryRepository();
		const transactionRepository = new InMemoryTransactionRepository();
		const userDefaultsBootstrapper = new UserDefaultsBootstrapper(
			accountRepository,
			categoryRepository,
		);
		const transactionAccountMigrator = new TransactionAccountMigrator(
			transactionRepository,
			categoryRepository,
		);

		const authSignup = {
			execute: async () => ({
				_id: "new-user-1",
				email: "new@a.com",
			}),
		} as unknown as AuthSignup;

		const authSignin = {
			execute: async () => ({
				user: { _id: "new-user-1", email: "new@a.com" },
				token: "t",
				refreshToken: "r",
			}),
		} as unknown as AuthSignin;

		const controller = new AuthController(
			authSignin,
			authSignup,
			{} as any,
			{} as any,
			userDefaultsBootstrapper,
			transactionAccountMigrator,
		);

		return { controller, accountRepository, categoryRepository };
	};

	test("a brand-new user is provisioned with a default account and categories on signup", async () => {
		const { controller, accountRepository, categoryRepository } = build();

		const { statusCode } = await invoke(controller.signup, {
			body: {
				email: "new@a.com",
				password: "x",
				name: "New",
				surename: "User",
				lastname: "Test",
			},
		});

		expect(statusCode).toBeLessThan(300);
		const accounts = await accountRepository.getAllForUser("new-user-1");
		expect(accounts).toHaveLength(1);
		expect(accounts[0].name).toBe(DEFAULT_ACCOUNT_NAME);
		const categories = await categoryRepository.getAllForUser("new-user-1");
		expect(categories.length).toBeGreaterThan(0);
	});
});
