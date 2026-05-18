import { Transaction } from "../../../../src/features/transaction/domain/transaction.entity";
import { TransactionRepository } from "../../../../src/features/transaction/domain/Transaction.repository";
import { TransactionType } from "../../../../src/domain/valueObjects/transactionType.valueObject";
import { NotFoundError } from "../../../../src/application/errors/notFoundError";
import { TransactionUpdater } from "../../../../src/features/transaction/application/useCases/transactionUpdater";

const FIXED_DATE = new Date("2024-01-01");

class PartialMockTransactionRepository
	implements Partial<TransactionRepository>
{
	findOne = (id: string): Promise<Transaction | null> => {
		if (id === "existingId" || id === "existingWithError") {
			return Promise.resolve({
				_id: "existingId",
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

	updateTransaction = (
		id: string,
		updatedTransaction: Partial<Transaction>
	): Promise<Transaction | null> => {
		if (id === "existingId") {
			return Promise.resolve({
				...(updatedTransaction as Transaction),
				_id: "existingId",
				createdAt: FIXED_DATE,
				updatedAt: new Date("2024-01-02"),
			});
		}
		if (id === "existingWithError") {
			throw new Error("");
		}
		return Promise.resolve(null);
	};
}

describe("TransactionUpdater", () => {
	test("Updates an existing transaction successfully", async () => {
		const transactionRepository = new PartialMockTransactionRepository();
		const transactionUpdater = new TransactionUpdater(
			transactionRepository as TransactionRepository
		);
		const expectedUpdatedTransaction: Transaction = {
			_id: "existingId",
			date: FIXED_DATE,
			value: 200,
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
			updatedAt: new Date("2024-01-02"),
		};

		const updatedTransaction = await transactionUpdater.execute("existingId", {
			value: 200,
		});

		expect(updatedTransaction).toEqual(expectedUpdatedTransaction);
	});

	test("Throws NotFoundError when the transaction does not exist", async () => {
		const transactionRepository = new PartialMockTransactionRepository();
		const transactionUpdater = new TransactionUpdater(
			transactionRepository as TransactionRepository
		);

		await expect(
			transactionUpdater.execute("nonExistingId", { value: 200 })
		).rejects.toThrow(NotFoundError);
	});

	test("Throws an error when updating fails", async () => {
		const transactionRepository = new PartialMockTransactionRepository();
		const transactionUpdater = new TransactionUpdater(
			transactionRepository as TransactionRepository
		);

		await expect(
			transactionUpdater.execute("existingWithError", { value: 200 })
		).rejects.toThrow("Error al guardar transacción");
	});
});
