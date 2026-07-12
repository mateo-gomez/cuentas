import { TransactionRepository } from "../../../../src/features/transaction/domain/Transaction.repository";
import { Transaction } from "../../../../src/features/transaction/domain/transaction.entity";
import { TransactionType } from "../../../../src/domain/valueObjects/transactionType.valueObject";
import { TransactionCreator } from "../../../../src/features/transaction/application/useCases/transactionCreator";

class MockTransactionRepository implements Partial<TransactionRepository> {
	createTransaction = (
		newTransaction: Omit<Transaction, "_id" | "createdAt" | "updatedAt">
	): Promise<Transaction> =>
		Promise.resolve({
			...newTransaction,
			_id: "newId",
			createdAt: new Date(),
			updatedAt: new Date(),
		});
}

describe("TransactionCreator", () => {
	// Freeze the clock so every `new Date()` in the test and the mock repo
	// resolves to the same instant. Without this the assertion compares two
	// independent `new Date()` calls and flakes whenever the millisecond ticks
	// between them (passes in isolation, fails under load).
	beforeAll(() => {
		jest.useFakeTimers().setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	test("TransactionCreator - Creates a new transaction successfully", async () => {
		// Arrange
		const newTransaction: Omit<Transaction, "_id" | "createdAt" | "updatedAt"> =
			{
				date: new Date(),
				value: 100,
				account: "account1",
				category: {
					_id: "categoryId1",
					name: "Category 1",
					icon: "icon1",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				type: TransactionType.income,
				description: "Income transaction",
			};
		const expectedTransaction: Transaction = {
			...newTransaction,
			_id: "newId",
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		const transactionCreator = new TransactionCreator(
			new MockTransactionRepository() as TransactionRepository
		);

		// Act
		const createdTransaction = await transactionCreator.execute(newTransaction);

		// Assert
		expect(createdTransaction).toEqual(expectedTransaction);
	});
});
