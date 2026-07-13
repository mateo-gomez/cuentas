import { BalanceGetter } from "../../application/useCases/balanceGetter";
import { BalanceInRangeGetter } from "../../application/useCases/balanceInRangeGetter";
import { GroupedTransactionByDayGetter } from "../../application/useCases/groupedTransactionByDayGetter";
import { GroupedTransactionByDayInRangeGetter } from "../../application/useCases/groupedTransactionByDayInRangeGetter";
import { TransactionAggregate } from "../../domain/transaction.aggregate";
import { Balance } from "../../domain/balance.entity";
import { HttpResponse } from "../../../../infrastructure/api/httpResponse";
import { Response } from "express";
import { catchAsync } from "../../../../application/utils/catchAsync";
import { RequestAuthenticated } from "../../../../infrastructure/api/middlewares/BaseMiddleware";

export class TransactionAggregateController {
	constructor(
		private readonly groupedTransactionByDayGetter: GroupedTransactionByDayGetter,
		private readonly groupedTransactionByDayInRangeGetter: GroupedTransactionByDayInRangeGetter,
		private readonly balanceInRangeGetter: BalanceInRangeGetter,
		private readonly balanceGetter: BalanceGetter
	) {}

	getAllTransactions = catchAsync(async (req: RequestAuthenticated, res: Response) => {
		const userId = req.user!.id;
		const { start, end, accountId } = req.query;
		const accountFilter =
			typeof accountId === "string" && accountId.length > 0
				? accountId
				: undefined;

		let transactionAggregates!: TransactionAggregate[];
		let balance!: Balance;

		if (start && end) {
			const startDate = new Date(start as string);
			const endDate = new Date(end as string);

			transactionAggregates =
				await this.groupedTransactionByDayInRangeGetter.execute(
					userId,
					startDate,
					endDate,
					accountFilter
				);
			balance = await this.balanceInRangeGetter.execute(
				userId,
				startDate,
				endDate,
				accountFilter
			);
		} else {
			transactionAggregates =
				await this.groupedTransactionByDayGetter.execute(userId, accountFilter);
			balance = await this.balanceGetter.execute(userId, accountFilter);
		}

		const responseBody = HttpResponse.success({
			transactions: transactionAggregates,
			balance,
		});
		res.status(responseBody.statusCode).json(responseBody);
	});
}
