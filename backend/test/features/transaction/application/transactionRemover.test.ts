import { TransactionRepository } from "../../../../src/features/transaction/domain/Transaction.repository";
import { NotFoundError } from "../../../../src/application/errors/notFoundError";
import { TransactionRemover } from "../../../../src/features/transaction/application/useCases/transactionRemover";

describe("TransactionRemover", () => {
	test("Removes an existing transaction successfully", async () => {
		const deleteMock = jest.fn().mockResolvedValue(undefined);
		const existsMock = jest.fn().mockResolvedValue(true);
		const transactionRepository = {
			exists: existsMock,
			delete: deleteMock,
		} as unknown as TransactionRepository;
		const transactionRemover = new TransactionRemover(transactionRepository);

		await transactionRemover.execute("existingId");

		expect(deleteMock).toHaveBeenCalledWith("existingId");
	});

	test("Throws NotFoundError when the transaction does not exist", async () => {
		const existsMock = jest.fn().mockResolvedValue(false);
		const deleteMock = jest.fn();
		const transactionRepository = {
			exists: existsMock,
			delete: deleteMock,
		} as unknown as TransactionRepository;
		const transactionRemover = new TransactionRemover(transactionRepository);

		await expect(transactionRemover.execute("nonExistingId")).rejects.toThrow(
			NotFoundError
		);
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

		await expect(transactionRemover.execute("existingId")).rejects.toThrow(
			"Error al eliminar categoría"
		);
	});
});
