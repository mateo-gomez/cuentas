import { CreateTransfer } from "../../../../src/features/transaction/application/useCases/CreateTransfer";
import { UpdateTransfer } from "../../../../src/features/transaction/application/useCases/UpdateTransfer";
import { InMemoryTransactionRepository } from "../../../../src/features/transaction/infrastructure/database/InMemoryTransaction.repository";
import { TransactionType } from "../../../../src/domain/valueObjects/transactionType.valueObject";

const baseInput = {
	userId: "user-1",
	fromAccountId: "bank-1",
	toAccountId: "card-1",
	value: 500,
	date: new Date("2026-07-10"),
	description: "Pago tarjeta",
	categoryId: "cat-transfer",
};

const seed = async () => {
	const repository = new InMemoryTransactionRepository();
	const { transferId } = await new CreateTransfer(repository).execute(baseInput);
	return { repository, transferId };
};

describe("UpdateTransfer", () => {
	test("rewrites BOTH legs with the new amount so they never drift", async () => {
		const { repository, transferId } = await seed();

		await new UpdateTransfer(repository).execute({
			userId: "user-1",
			transferId,
			fromAccountId: "bank-1",
			toAccountId: "card-1",
			value: 800,
			date: new Date("2026-07-11"),
			description: "Pago tarjeta corregido",
		});

		const legs = await repository.findByTransferId("user-1", transferId);
		expect(legs).toHaveLength(2);
		expect(legs.every((leg) => leg.value === 800)).toBe(true);
		expect(legs.every((leg) => leg.description === "Pago tarjeta corregido")).toBe(
			true
		);
		expect(legs.every((leg) => leg.isTransfer === true)).toBe(true);
	});

	test("moving the accounts swaps both legs and keeps the roles", async () => {
		const { repository, transferId } = await seed();

		await new UpdateTransfer(repository).execute({
			userId: "user-1",
			transferId,
			fromAccountId: "bank-2",
			toAccountId: "card-1",
			value: 500,
			date: baseInput.date,
			description: baseInput.description,
		});

		const legs = await repository.findByTransferId("user-1", transferId);
		const source = legs.find((leg) => leg.type === TransactionType.expenses);
		const dest = legs.find((leg) => leg.type === TransactionType.income);

		expect(source?.accountId).toBe("bank-2");
		expect(source?.counterpartyAccountId).toBe("card-1");
		expect(dest?.accountId).toBe("card-1");
		expect(dest?.counterpartyAccountId).toBe("bank-2");
	});

	test("throws when the transfer does not exist", async () => {
		const { repository } = await seed();

		await expect(
			new UpdateTransfer(repository).execute({
				userId: "user-1",
				transferId: "missing",
				fromAccountId: "bank-1",
				toAccountId: "card-1",
				value: 500,
				date: baseInput.date,
				description: "",
			})
		).rejects.toThrow();
	});
});
