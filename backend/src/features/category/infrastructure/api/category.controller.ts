import { isIdValid } from "../../../../infrastructure/api/utils/isIdValid";
import { ValidationError } from "../../../../infrastructure/api/errors/validationError";
import { HttpResponse } from "../../../../infrastructure/api/httpResponse";
import { Response } from "express";
import { RequestAuthenticated } from "../../../../infrastructure/api/middlewares/BaseMiddleware";
import { CategoryByIdGetter } from "../../application/categoryByIdGetter";
import { CategoryCreator } from "../../application/categoryCreator";
import { CategoryGetter } from "../../application/categoryGetter";
import { CategoryRemover } from "../../application/categoryRemover";
import { CategoryUpdater } from "../../application/categoryUpdater";
import { catchAsync } from "../../../../application/utils/catchAsync";

export class CategoryController {
	constructor(
		private readonly categoryByIdGetter: CategoryByIdGetter,
		private readonly categoryGetter: CategoryGetter,
		private readonly categoryCreator: CategoryCreator,
		private readonly categoryUpdater: CategoryUpdater,
		private readonly categoryRemover: CategoryRemover
	) {}

	getCategory = catchAsync(async (request: RequestAuthenticated, response: Response) => {
		const userId = request.user!.id;
		const { id } = request.params;

		if (!isIdValid(id)) {
			throw new ValidationError().addError("id", `El id ${id} is inválido`);
		}

		const category = await this.categoryByIdGetter.execute(userId, id);

		const responseBody = HttpResponse.success(category);
		response.status(responseBody.statusCode).json(responseBody);
	});

	getCategories = catchAsync(async (request: RequestAuthenticated, response: Response) => {
		const userId = request.user!.id;
		const categories = await this.categoryGetter.execute(userId);

		const responseBody = HttpResponse.success(categories);
		response.status(responseBody.statusCode).json(responseBody);
	});

	saveCategory = catchAsync(async (request: RequestAuthenticated, response: Response) => {
		const userId = request.user!.id;
		const { name, icon } = request.body;

		const category = await this.categoryCreator.execute(userId, name, icon);

		const responseBody = HttpResponse.success(category);
		response.status(responseBody.statusCode).json(responseBody);
	});

	updateCategory = catchAsync(async (request: RequestAuthenticated, response: Response) => {
		const userId = request.user!.id;
		const { id } = request.params;
		const { name, icon } = request.body;

		if (!isIdValid(id)) {
			throw new ValidationError().addError("id", `El id ${id} is inválido`);
		}

		const category = await this.categoryUpdater.execute(userId, id, name, icon);

		const responseBody = HttpResponse.success(category);
		response.status(responseBody.statusCode).json(responseBody);
	});

	deleteCategory = catchAsync(async (request: RequestAuthenticated, response: Response) => {
		const userId = request.user!.id;
		const { id } = request.params;

		if (!isIdValid(id)) {
			throw new ValidationError().addError("id", `El id ${id} is inválido`);
		}

		await this.categoryRemover.execute(userId, id);

		const responseBody = HttpResponse.success();
		response.status(responseBody.statusCode).json(responseBody);
	});
}
