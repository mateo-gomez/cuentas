import { RouterContext } from "../../../../../deps.ts";
import { HttpResponse } from "../../../../infrastructure/api/httpResponse.ts";
import { DateRangeGetter } from "../../application/dateRangeGetter.ts";

export class DatesController {
	constructor(private readonly dateRangeGetter: DateRangeGetter) {}

	dateRange = async ({ response }: RouterContext<string>) => {
		const dateRange = await this.dateRangeGetter.execute();

		const responseBody = HttpResponse.success(dateRange);
		response.status = responseBody.statusCode;
		response.body = responseBody;
	};
}
