import { Request, Response } from "express";
import { HttpResponse } from "../../../../infrastructure/api/httpResponse";
import { DateRangeGetter } from "../../application/dateRangeGetter";

export class DatesController {
	constructor(private readonly dateRangeGetter: DateRangeGetter) {}

	dateRange = async (req:Request, res:Response) => {
		const dateRange = await this.dateRangeGetter.execute();

		const responseBody = HttpResponse.success(dateRange);
		res.status(responseBody.statusCode)
			.json(responseBody);
	};
}
