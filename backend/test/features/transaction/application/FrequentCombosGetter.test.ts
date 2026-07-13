import { FrequentCombosGetter } from "../../../../src/features/transaction/application/useCases/FrequentCombosGetter";
import { InMemoryTransactionRepository } from "../../../../src/features/transaction/infrastructure/database/InMemoryTransaction.repository";
import { TransactionType } from "../../../../src/domain/valueObjects/transactionType.valueObject";
import { Category } from "../../../../src/features/category/domain/category.entity";

const USER_ID = "user-1";
const ACCOUNT_ID = "account-1";
const OTHER_ACCOUNT_ID = "account-2";

const category = (id: string, name = "Comida"): Category => ({
	_id: id,
	userId: USER_ID,
	name,
	icon: "fast-food-outline",
	createdAt: new Date(),
	updatedAt: new Date(),
});

const buildGetter = () => {
	const transactionRepository = new InMemoryTransactionRepository();
	const getter = new FrequentCombosGetter(transactionRepository);
	return { getter, transactionRepository };
};

describe("FrequentCombosGetter", () => {
	test("returns combos sorted by frequency, scoped to userId and accountId", async () => {
		const { getter, transactionRepository } = buildGetter();
		const cat = category("cat-1");

		for (let i = 0; i < 3; i++) {
			await transactionRepository.createTransaction({
				userId: USER_ID,
				accountId: ACCOUNT_ID,
				date: new Date(),
				value: 1000,
				category: cat,
				type: TransactionType.expenses,
				description: "Café",
			});
		}

		await transactionRepository.createTransaction({
			userId: USER_ID,
			accountId: ACCOUNT_ID,
			date: new Date(),
			value: 5000,
			category: cat,
			type: TransactionType.expenses,
			description: "Super",
		});

		// Different account — must not be counted when filtering by ACCOUNT_ID.
		await transactionRepository.createTransaction({
			userId: USER_ID,
			accountId: OTHER_ACCOUNT_ID,
			date: new Date(),
			value: 2000,
			category: cat,
			type: TransactionType.expenses,
			description: "Café",
		});

		const result = await getter.execute(USER_ID, ACCOUNT_ID);

		expect(result[0]).toMatchObject({ description: "Café", count: 3 });
		expect(result.every((combo) => combo.accountId === ACCOUNT_ID)).toBe(true);
	});

	test("respects both transaction types without inverting the enum", async () => {
		const { getter, transactionRepository } = buildGetter();
		const cat = category("cat-1");

		await transactionRepository.createTransaction({
			userId: USER_ID,
			accountId: ACCOUNT_ID,
			date: new Date(),
			value: 1000,
			category: cat,
			type: TransactionType.expenses,
			description: "Café",
		});
		await transactionRepository.createTransaction({
			userId: USER_ID,
			accountId: ACCOUNT_ID,
			date: new Date(),
			value: 30000,
			category: cat,
			type: TransactionType.income,
			description: "Sueldo",
		});

		const result = await getter.execute(USER_ID, ACCOUNT_ID);

		const expenseCombo = result.find((combo) => combo.description === "Café");
		const incomeCombo = result.find((combo) => combo.description === "Sueldo");

		expect(expenseCombo?.type).toBe(TransactionType.expenses);
		expect(incomeCombo?.type).toBe(TransactionType.income);
	});

	test("skips combos whose category has been deleted", async () => {
		const { getter, transactionRepository } = buildGetter();
		const cat = category("deleted-cat");

		await transactionRepository.createTransaction({
			userId: USER_ID,
			accountId: ACCOUNT_ID,
			date: new Date(),
			value: 1000,
			category: null as unknown as Category,
			type: TransactionType.expenses,
			description: "Orphan",
		});

		const result = await getter.execute(USER_ID, ACCOUNT_ID);

		expect(result.find((combo) => combo.description === "Orphan")).toBeUndefined();
	});

	test("respects the limit", async () => {
		const { getter, transactionRepository } = buildGetter();

		for (let i = 0; i < 7; i++) {
			await transactionRepository.createTransaction({
				userId: USER_ID,
				accountId: ACCOUNT_ID,
				date: new Date(),
				value: 1000,
				category: category(`cat-${i}`, `Cat ${i}`),
				type: TransactionType.expenses,
				description: `Desc ${i}`,
			});
		}

		const result = await getter.execute(USER_ID, ACCOUNT_ID, 5);

		expect(result).toHaveLength(5);
	});

	test("empty history returns an empty array without error", async () => {
		const { getter } = buildGetter();

		const result = await getter.execute(USER_ID, ACCOUNT_ID);

		expect(result).toEqual([]);
	});
});
