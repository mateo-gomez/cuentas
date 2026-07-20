import { TransactionRepository } from "../../../../src/features/transaction/domain/Transaction.repository";
import { NotFoundError } from "../../../../src/application/errors/notFoundError";
import { TransactionRemover } from "../../../../src/features/transaction/application/useCases/transactionRemover";
import { InMemoryTransactionRepository } from "../../../../src/features/transaction/infrastructure/database/InMemoryTransaction.repository";
import { TransactionType } from "../../../../src/domain/valueObjects/transactionType.valueObject";

describe("TransactionRemover", () => {
	test("Removes an existing transaction successfully", async () => {
		const deleteMock = jest.fn().mockResolvedValue(undefined);
		const findOneMock = jest.fn().mockResolvedValue({ _id: "existingId" });
		const transactionRepository = {
			findOne: findOneMock,
			delete: deleteMock,
		} as unknown as TransactionRepository;
		const transactionRemover = new TransactionRemover(transactionRepository);

		await transactionRemover.execute("user-1", "existingId");

		expect(findOneMock).toHaveBeenCalledWith("user-1", "existingId");
		expect(deleteMock).toHaveBeenCalledWith("user-1", "existingId");
	});

	test("Deletes both legs when the transaction is a transfer", async () => {
		const deleteMock = jest.fn().mockResolvedValue(undefined);
		const deleteByTransferIdMock = jest.fn().mockResolvedValue(2);
		const findOneMock = jest
			.fn()
			.mockResolvedValue({ _id: "legId", transferId: "transfer-1" });
		const transactionRepository = {
			findOne: findOneMock,
			delete: deleteMock,
			deleteByTransferId: deleteByTransferIdMock,
		} as unknown as TransactionRepository;
		const transactionRemover = new TransactionRemover(transactionRepository);

		await transactionRemover.execute("user-1", "legId");

		expect(deleteByTransferIdMock).toHaveBeenCalledWith("user-1", "transfer-1");
		expect(deleteMock).not.toHaveBeenCalled();
	});

	test("Throws NotFoundError when the transaction does not exist", async () => {
		const findOneMock = jest.fn().mockResolvedValue(null);
		const deleteMock = jest.fn();
		const transactionRepository = {
			findOne: findOneMock,
			delete: deleteMock,
		} as unknown as TransactionRepository;
		const transactionRemover = new TransactionRemover(transactionRepository);

		await expect(
			transactionRemover.execute("user-1", "nonExistingId")
		).rejects.toThrow(NotFoundError);
		expect(deleteMock).not.toHaveBeenCalled();
	});

	test("Throws an error when deletion fails", async () => {
		const findOneMock = jest.fn().mockResolvedValue({ _id: "existingId" });
		const deleteMock = jest
			.fn()
			.mockRejectedValue(new Error("Failed to delete"));
		const transactionRepository = {
			findOne: findOneMock,
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
