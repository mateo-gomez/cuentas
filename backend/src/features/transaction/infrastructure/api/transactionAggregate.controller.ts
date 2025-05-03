import { BalanceGetter } from "../../application/useCases/balanceGetter";
import { BalanceInRangeGetter } from "../../application/useCases/balanceInRangeGetter";
import { GroupedTransactionByDayGetter } from "../../application/useCases/groupedTransactionByDayGetter";
import { GroupedTransactionByDayInRangeGetter } from "../../application/useCases/groupedTransactionByDayInRangeGetter";
import { TransactionAggregate } from "../../domain/transaction.aggregate";
import { Balance } from "../../domain/balance.entity";
import { HttpResponse } from "../../../../infrastructure/api/httpResponse";
import { Request, Response } from "express";
import { catchAsync } from "../../../../application/utils/catchAsync";

export class TransactionAggregateController {
	constructor(
		private readonly groupedTransactionByDayGetter: GroupedTransactionByDayGetter,
		private readonly groupedTransactionByDayInRangeGetter: GroupedTransactionByDayInRangeGetter,
		private readonly balanceInRangeGetter: BalanceInRangeGetter,
		private readonly balanceGetter: BalanceGetter
	) {}

	getAllTransactions = catchAsync(async (req: Request, res: Response) => {
		const { start, end } = req.query;

		let transactionAggregates!: TransactionAggregate[];
		let balance!: Balance;

		if (start && end) {
			const startDate = new Date(start as string);
			const endDate = new Date(end as string);

			transactionAggregates =
				await this.groupedTransactionByDayInRangeGetter.execute(
					startDate,
					endDate
				);
			balance = await this.balanceInRangeGetter.execute(startDate, endDate);
		} else {
			transactionAggregates =
				await this.groupedTransactionByDayGetter.execute();
			balance = await this.balanceGetter.execute();
		}

		const responseBody = HttpResponse.success({
			transactions: transactionAggregates,
			balance,
		});
		res.status(responseBody.statusCode).json(responseBody);
	});
}
