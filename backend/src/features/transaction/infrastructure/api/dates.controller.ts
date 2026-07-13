import { Response } from "express";
import { HttpResponse } from "../../../../infrastructure/api/httpResponse";
import { DateRangeGetter } from "../../application/useCases/dateRangeGetter";
import { catchAsync } from "../../../../application/utils/catchAsync";
import { RequestAuthenticated } from "../../../../infrastructure/api/middlewares/BaseMiddleware";

export class DatesController {
	constructor(private readonly dateRangeGetter: DateRangeGetter) {}

	dateRange = catchAsync(async (req: RequestAuthenticated, res: Response) => {
		const userId = req.user!.id;
		const dateRange = await this.dateRangeGetter.execute(userId);

		const responseBody = HttpResponse.success(dateRange);
		res.status(responseBody.statusCode).json(responseBody);
	});
}
