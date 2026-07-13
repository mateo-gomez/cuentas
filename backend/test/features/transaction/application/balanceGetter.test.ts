import { TransactionRepository } from "../../../../src/features/transaction/domain/Transaction.repository";
import { Balance } from "../../../../src/features/transaction/domain/balance.entity";
import { BalanceGetter } from "../../../../src/features/transaction/application/useCases/balanceGetter";

class PartialMockTransactionRepository
	implements Partial<TransactionRepository>
{
	sumAll = jest.fn((): Promise<Balance> => {
		return Promise.resolve({
			incomes: 5000,
			expenses: 3000,
			balance: 2000,
		});
	});
}

test("BalanceGetter - Returns balance successfully", async () => {
	const expectedBalance: Balance = {
		incomes: 5000,
		expenses: 3000,
		balance: 2000,
	};
	const transactionRepository = new PartialMockTransactionRepository();
	const balanceGetter = new BalanceGetter(
		transactionRepository as TransactionRepository
	);

	const balance = await balanceGetter.execute("user-1");

	expect(balance).toEqual(expectedBalance);
	expect(transactionRepository.sumAll).toHaveBeenCalledWith("user-1", undefined);
});

test("BalanceGetter - forwards accountId for per-account balance", async () => {
	const transactionRepository = new PartialMockTransactionRepository();
	const balanceGetter = new BalanceGetter(
		transactionRepository as TransactionRepository
	);

	await balanceGetter.execute("user-1", "account-1");

	expect(transactionRepository.sumAll).toHaveBeenCalledWith("user-1", "account-1");
});
