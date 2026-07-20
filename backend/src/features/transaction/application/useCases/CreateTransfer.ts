import { randomUUID } from "crypto";
import { TransactionType } from "../../../../domain/valueObjects/transactionType.valueObject";
import { TransactionRepository } from "../../domain/Transaction.repository";
import { TransactionDTO } from "../dto/transactionDTO";

export interface CreateTransferInput {
	userId: string;
	fromAccountId: string;
	toAccountId: string;
	value: number;
	date: Date;
	description: string;
	/** Category id both legs are tagged with (resolved by the caller). */
	categoryId: string;
}

export interface CreateTransferResult {
	transferId: string;
}

/**
 * Creates a transfer between two of the user's own accounts as a pair of
 * linked transactions sharing a `transferId`:
 *  - source account: an `expenses` leg (money leaves)
 *  - destination account: an `income` leg (money arrives)
 *
 * Both legs carry `isTransfer: true`, so they move each account's balance but
 * are excluded from global income/expense totals. The canonical case is paying
 * a credit card from a bank account — the expense was already counted when the
 * card was used, so the payment must not be counted again.
 *
 * Account ownership and the `from !== to` / positive-value guards are enforced
 * by the controller before this runs.
 */
export class CreateTransfer {
	constructor(private readonly transactionRepository: TransactionRepository) {}

	execute = async (
		input: CreateTransferInput
	): Promise<CreateTransferResult> => {
		const {
			userId,
			fromAccountId,
			toAccountId,
			value,
			date,
			description,
			categoryId,
		} = input;

		const transferId = randomUUID();
		const amount = Math.abs(value);

		const legs: TransactionDTO[] = [
			{
				userId,
				accountId: fromAccountId,
				category: categoryId,
				type: TransactionType.expenses,
				value: amount,
				date,
				description,
				isTransfer: true,
				transferId,
				counterpartyAccountId: toAccountId,
			},
			{
				userId,
				accountId: toAccountId,
				category: categoryId,
				type: TransactionType.income,
				value: amount,
				date,
				description,
				isTransfer: true,
				transferId,
				counterpartyAccountId: fromAccountId,
			},
		];

		await this.transactionRepository.saveMany(legs);

		return { transferId };
	};
}
