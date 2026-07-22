import { TransactionType } from "../../../../domain/valueObjects/transactionType.valueObject";
import { NotFoundError } from "../../../../application/errors/notFoundError";
import { ApplicationError } from "../../../../application/errors/applicationError";
import { Transaction } from "../../domain/transaction.entity";
import { TransactionRepository } from "../../domain/Transaction.repository";

export interface UpdateTransferInput {
	userId: string;
	transferId: string;
	fromAccountId: string;
	toAccountId: string;
	value: number;
	date: Date;
	description: string;
}

/**
 * Edits an existing transfer by rewriting BOTH linked legs at once, so the two
 * sides can never drift apart (the bug that appears when a transfer leg is
 * edited through the normal single-transaction update path).
 *
 * Roles are preserved: the source stays the `expenses` leg, the destination the
 * `income` leg. Category and `isTransfer` are kept as-is — only amount, date,
 * description, and which accounts the money moves between can change.
 *
 * Account ownership and the `from !== to` / positive-value guards are enforced
 * by the controller before this runs.
 */
export class UpdateTransfer {
	constructor(private readonly transactionRepository: TransactionRepository) {}

	execute = async (input: UpdateTransferInput): Promise<void> => {
		const { userId, transferId, fromAccountId, toAccountId, value, date, description } =
			input;

		const legs = await this.transactionRepository.findByTransferId(
			userId,
			transferId
		);

		if (legs.length === 0) {
			throw new NotFoundError("Transferencia no encontrada", transferId);
		}

		const sourceLeg = legs.find((leg) => leg.type === TransactionType.expenses);
		const destinationLeg = legs.find(
			(leg) => leg.type === TransactionType.income
		);

		if (!sourceLeg || !destinationLeg) {
			throw new ApplicationError(
				"Transferencia corrupta: faltan legs origen/destino"
			);
		}

		const amount = Math.abs(value);

		// category is populated on read; the write path expects the id.
		const categoryId = (leg: Transaction): string =>
			((leg.category as unknown as { _id?: string })?._id ??
				(leg.category as unknown as string)) as string;

		const baseLeg = (leg: Transaction, accountId: string, counterparty: string) => ({
			userId,
			accountId,
			account: leg.account,
			category: categoryId(leg) as unknown as Transaction["category"],
			date,
			description,
			value: amount,
			type: leg.type,
			isTransfer: true,
			transferId,
			counterpartyAccountId: counterparty,
		});

		try {
			await this.transactionRepository.updateTransaction(
				userId,
				sourceLeg._id,
				baseLeg(sourceLeg, fromAccountId, toAccountId)
			);
			await this.transactionRepository.updateTransaction(
				userId,
				destinationLeg._id,
				baseLeg(destinationLeg, toAccountId, fromAccountId)
			);
		} catch (error) {
			throw new ApplicationError("Error al actualizar transferencia", error);
		}
	};
}
