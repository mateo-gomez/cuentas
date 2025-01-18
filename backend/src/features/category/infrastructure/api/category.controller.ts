import { isIdValid } from "../../../../infrastructure/api/utils/isIdValid";
import { ValidationError } from "../../../../infrastructure/api/errors/validationError";
import { HttpResponse } from "../../../../infrastructure/api/httpResponse";
import { Request, Response } from "express";
import { CategoryByIdGetter } from "../../application/categoryByIdGetter";
import { CategoryCreator } from "../../application/categoryCreator";
import { CategoryGetter } from "../../application/categoryGetter";
import { CategoryRemover } from "../../application/categoryRemover";
import { CategoryUpdater } from "../../application/categoryUpdater";

export class CategoryController {
	constructor(
		private readonly categoryByIdGetter: CategoryByIdGetter,
		private readonly categoryGetter: CategoryGetter,
		private readonly categoryCreator: CategoryCreator,
		private readonly categoryUpdater: CategoryUpdater,
		private readonly categoryRemover: CategoryRemover
	) {}

	getCategory = async (request: Request, response: Response) => {
		const { id } = request.params;

		if (!isIdValid(id)) {
			throw new ValidationError().addError("id", `El id ${id} is inválido`);
		}

		const category = await this.categoryByIdGetter.execute(id);

		const responseBody = HttpResponse.success(category);
		response.status(responseBody.statusCode).json(responseBody);
	};

	getCategories = async (_request: Request, response: Response) => {
		const categories = await this.categoryGetter.execute();

		const responseBody = HttpResponse.success(categories);
		response.status(responseBody.statusCode).json(responseBody);
	};

	saveCategory = async (request: Request, response: Response) => {
		const { name, icon } = request.body;

		const category = await this.categoryCreator.execute(name, icon);

		const responseBody = HttpResponse.success(category);
		response.status(responseBody.statusCode).json(responseBody);
	};

	updateCategory = async (request: Request, response: Response) => {
		const { id } = request.params;
		const { name, icon } = request.body;

		if (!isIdValid(id)) {
			throw new ValidationError().addError("id", `El id ${id} is inválido`);
		}

		const category = await this.categoryUpdater.execute(id, name, icon);

		const responseBody = HttpResponse.success(category);
		response.status(responseBody.statusCode).json(responseBody);
	};

	deleteCategory = async (request: Request, response: Response) => {
		const { id } = request.params;

		if (!isIdValid(id)) {
			throw new ValidationError().addError("id", `El id ${id} is inválido`);
		}

		await this.categoryRemover.execute(id);

		const responseBody = HttpResponse.success();
		response.status(responseBody.statusCode).json(responseBody);
	};
}
