import { TransactionRepository } from "../../../../src/features/transaction/domain/Transaction.repository";
import { Transaction } from "../../../../src/features/transaction/domain/transaction.entity";
import { TransactionType } from "../../../../src/domain/valueObjects/transactionType.valueObject";
import { TransactionByIdGetter } from "../../../../src/features/transaction/application/useCases/TransactionByIdGetter";

const FIXED_DATE = new Date("2024-01-01");

class MockTransactionRepository implements Partial<TransactionRepository> {
	findOne = (id: string): Promise<Transaction | null> => {
		if (id === "1") {
			return Promise.resolve({
				_id: "1",
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
		};
		const transactionByIdGetter = new TransactionByIdGetter(
			new MockTransactionRepository() as TransactionRepository
		);

		const transaction = await transactionByIdGetter.execute("1");

		expect(transaction).toBeDefined();
		expect(transaction).not.toBeNull();
		expect(transaction).toEqual(expectedTransaction);
	});

	test("Returns null when the transaction does not exist", async () => {
		const transactionByIdGetter = new TransactionByIdGetter(
			new MockTransactionRepository() as TransactionRepository
		);

		const transaction = await transactionByIdGetter.execute("nonexistentId");

		expect(transaction).toBeNull();
	});
});
