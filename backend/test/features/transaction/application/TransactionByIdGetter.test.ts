import { TransactionRepository } from "../../../../src/features/transaction/domain/Transaction.repository";
import { Transaction } from "../../../../src/features/transaction/domain/transaction.entity";
import { TransactionType } from "../../../../src/domain/valueObjects/transactionType.valueObject";
import { TransactionByIdGetter } from "../../../../src/features/transaction/application/useCases/TransactionByIdGetter";

const FIXED_DATE = new Date("2024-01-01");

class MockTransactionRepository implements Partial<TransactionRepository> {
	findOne = (userId: string, id: string): Promise<Transaction | null> => {
		if (userId === "user-1" && id === "1") {
			return Promise.resolve({
				_id: "1",
				userId: "user-1",
				date: FIXED_DATE,
				value: 100,
				account: "account1",
				category: {
					_id: "categoryId1",
					name: "Category 1",
					icon: "icon1",
					createdAt: FIXED_DATE,
					updatedAt: FIXED_DATE,
				},
				type: TransactionType.income,
				description: "Income transaction",
				createdAt: FIXED_DATE,
				updatedAt: FIXED_DATE,
			});
		}
		return Promise.resolve(null);
	};
}

describe("TransactionByIdGetter", () => {
	test("Returns the transaction when it exists", async () => {
		const expectedTransaction: Transaction = {
			_id: "1",
			userId: "user-1",
			date: FIXED_DATE,
			value: 100,
			account: "account1",
			category: {
				_id: "categoryId1",
				name: "Category 1",
				icon: "icon1",
				createdAt: FIXED_DATE,
				updatedAt: FIXED_DATE,
			},
			type: TransactionType.income,
			description: "Income transaction",
			createdAt: FIXED_DATE,
			updatedAt: FIXED_DATE,
		} as Transaction;
		const transactionByIdGetter = new TransactionByIdGetter(
			new MockTransactionRepository() as TransactionRepository
		);

		const transaction = await transactionByIdGetter.execute("user-1", "1");

		expect(transaction).toBeDefined();
		expect(transaction).not.toBeNull();
		expect(transaction).toEqual(expectedTransaction);
	});

	test("Returns null when the transaction does not exist", async () => {
		const transactionByIdGetter = new TransactionByIdGetter(
			new MockTransactionRepository() as TransactionRepository
		);

		const transaction = await transactionByIdGetter.execute(
			"user-1",
			"nonexistentId"
		);

		expect(transaction).toBeNull();
	});

	test("Returns null for another user's transaction id (cross-user access is not leaked)", async () => {
		const transactionByIdGetter = new TransactionByIdGetter(
			new MockTransactionRepository() as TransactionRepository
		);

		const transaction = await transactionByIdGetter.execute("attacker", "1");

		expect(transaction).toBeNull();
	});
});
