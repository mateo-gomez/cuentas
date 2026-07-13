import { DateRangeGetter } from "../../../../src/features/transaction/application/useCases/dateRangeGetter";
import { InMemoryTransactionRepository } from "../../../../src/features/transaction/infrastructure/database/InMemoryTransaction.repository";
import { TransactionType } from "../../../../src/domain/valueObjects/transactionType.valueObject";

describe("DateRangeGetter", () => {
	test("returns only the caller's earliest transaction date, ignoring other users' earlier records", async () => {
		const repository = new InMemoryTransactionRepository();
		await repository.createTransaction({
			userId: "other-user",
			accountId: "acc-other",
			account: "",
			date: new Date("2020-01-01"),
			value: 10,
			type: TransactionType.expenses,
			description: "another user's older transaction",
			category: { _id: "cat-1" } as any,
		} as any);
		await repository.createTransaction({
			userId: "user-1",
			accountId: "acc-1",
			account: "",
			date: new Date("2023-05-01"),
			value: 20,
			type: TransactionType.income,
			description: "caller's own transaction",
			category: { _id: "cat-1" } as any,
		} as any);

		const dateRangeGetter = new DateRangeGetter(repository);

		const range = await dateRangeGetter.execute("user-1");

		expect(range.start).toEqual(new Date("2023-05-01"));
	});

	test("falls back to now as start when the caller has no transactions", async () => {
		const repository = new InMemoryTransactionRepository();
		const dateRangeGetter = new DateRangeGetter(repository);

		const range = await dateRangeGetter.execute("user-1");

		expect(range.start.getTime()).toBeCloseTo(range.end.getTime(), -2);
	});
});
