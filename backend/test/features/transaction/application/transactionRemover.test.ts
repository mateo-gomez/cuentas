import { TransactionRepository } from "../../../../src/features/transaction/domain/Transaction.repository";
import { NotFoundError } from "../../../../src/application/errors/notFoundError";
import { TransactionRemover } from "../../../../src/features/transaction/application/useCases/transactionRemover";
import { InMemoryTransactionRepository } from "../../../../src/features/transaction/infrastructure/database/InMemoryTransaction.repository";
import { TransactionType } from "../../../../src/domain/valueObjects/transactionType.valueObject";

describe("TransactionRemover", () => {
	test("Removes an existing transaction successfully", async () => {
		const deleteMock = jest.fn().mockResolvedValue(undefined);
		const existsMock = jest.fn().mockResolvedValue(true);
		const transactionRepository = {
			exists: existsMock,
			delete: deleteMock,
		} as unknown as TransactionRepository;
		const transactionRemover = new TransactionRemover(transactionRepository);

		await transactionRemover.execute("user-1", "existingId");

		expect(existsMock).toHaveBeenCalledWith("user-1", "existingId");
		expect(deleteMock).toHaveBeenCalledWith("user-1", "existingId");
	});

	test("Throws NotFoundError when the transaction does not exist", async () => {
		const existsMock = jest.fn().mockResolvedValue(false);
		const deleteMock = jest.fn();
		const transactionRepository = {
			exists: existsMock,
			delete: deleteMock,
		} as unknown as TransactionRepository;
		const transactionRemover = new TransactionRemover(transactionRepository);

		await expect(
			transactionRemover.execute("user-1", "nonExistingId")
		).rejects.toThrow(NotFoundError);
		expect(deleteMock).not.toHaveBeenCalled();
	});

	test("Throws an error when deletion fails", async () => {
		const existsMock = jest.fn().mockResolvedValue(true);
		const deleteMock = jest
			.fn()
			.mockRejectedValue(new Error("Failed to delete"));
		const transactionRepository = {
			exists: existsMock,
			delete: deleteMock,
		} as unknown as TransactionRepository;
		const transactionRemover = new TransactionRemover(transactionRepository);

		await expect(
			transactionRemover.execute("user-1", "existingId")
		).rejects.toThrow("Error al eliminar categoría");
	});

	test("A cross-user id yields not-found instead of deleting another user's transaction", async () => {
		const repository = new InMemoryTransactionRepository();
		const owned = await repository.createTransaction({
			userId: "owner",
			accountId: "acc-1",
			account: "",
			date: new Date(),
			value: 100,
			type: TransactionType.expenses,
			description: "owner's transaction",
			category: { _id: "cat-1" } as any,
		} as any);
		const transactionRemover = new TransactionRemover(repository);

		await expect(
			transactionRemover.execute("attacker", owned._id)
		).rejects.toThrow(NotFoundError);

		expect(await repository.exists("owner", owned._id)).toBe(true);
	});
});
