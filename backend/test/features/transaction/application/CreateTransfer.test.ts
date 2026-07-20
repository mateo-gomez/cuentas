import { CreateTransfer } from "../../../../src/features/transaction/application/useCases/CreateTransfer";
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

describe("CreateTransfer", () => {
	test("creates two linked legs sharing a transferId", async () => {
		const repository = new InMemoryTransactionRepository();
		const createTransfer = new CreateTransfer(repository);

		const { transferId } = await createTransfer.execute(baseInput);

		const legs = await repository.getAll("user-1");
		expect(legs).toHaveLength(2);
		expect(legs.every((leg) => leg.transferId === transferId)).toBe(true);
		expect(legs.every((leg) => leg.isTransfer === true)).toBe(true);

		const source = legs.find((leg) => leg.accountId === "bank-1");
		const dest = legs.find((leg) => leg.accountId === "card-1");
		expect(source?.type).toBe(TransactionType.expenses);
		expect(source?.counterpartyAccountId).toBe("card-1");
		expect(dest?.type).toBe(TransactionType.income);
		expect(dest?.counterpartyAccountId).toBe("bank-1");
	});

	test("stores a positive value on both legs even if given a negative amount", async () => {
		const repository = new InMemoryTransactionRepository();
		const createTransfer = new CreateTransfer(repository);

		await createTransfer.execute({ ...baseInput, value: -500 });

		const legs = await repository.getAll("user-1");
		expect(legs.every((leg) => leg.value === 500)).toBe(true);
	});

	test("transfer is excluded from global totals but moves each account balance", async () => {
		const repository = new InMemoryTransactionRepository();
		const createTransfer = new CreateTransfer(repository);

		await createTransfer.execute(baseInput);

		// Global totals (excludeTransfers = true) ignore the move entirely.
		const global = await repository.sumAll("user-1", undefined, true);
		expect(global.incomes).toBe(0);
		expect(global.expenses).toBe(0);

		// Per-account balance (excludeTransfers = false) reflects the move.
		const bank = await repository.sumAll("user-1", "bank-1");
		const card = await repository.sumAll("user-1", "card-1");
		expect(bank.balance).toBe(-500); // money left the bank
		expect(card.balance).toBe(500); // debt reduced on the card
	});

	test("deleteByTransferId removes both legs", async () => {
		const repository = new InMemoryTransactionRepository();
		const createTransfer = new CreateTransfer(repository);

		const { transferId } = await createTransfer.execute(baseInput);
		const removed = await repository.deleteByTransferId("user-1", transferId);

		expect(removed).toBe(2);
		expect(await repository.getAll("user-1")).toHaveLength(0);
	});
});
