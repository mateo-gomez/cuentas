import { isIdValid } from "../../../../infrastructure/api/utils/isIdValid.ts";
import { ValidationError } from "../../../../infrastructure/api/errors/validationError.ts";
import { HttpResponse } from "../../../../infrastructure/api/httpResponse.ts";
import { RouterContext } from "../../../../../deps.ts";
import { CategoryByIdGetter } from "../../application/categoryByIdGetter.ts";
import { CategoryCreator } from "../../application/categoryCreator.ts";
import { CategoryGetter } from "../../application/categoryGetter.ts";
import { CategoryRemover } from "../../application/categoryRemover.ts";
import { CategoryUpdater } from "../../application/categoryUpdater.ts";

export class CategoryController {
  constructor(
    private readonly categoryByIdGetter: CategoryByIdGetter,
    private readonly categoryGetter: CategoryGetter,
    private readonly categoryCreator: CategoryCreator,
    private readonly categoryUpdater: CategoryUpdater,
    private readonly categoryRemover: CategoryRemover,
  ) {}

  getCategory = async ({
    response,
    params,
  }: RouterContext<string>) => {
    const { id } = params;

    if (!isIdValid(id)) {
      throw new ValidationError().addError("id", `El id ${id} is inválido`);
    }

    const category = await this.categoryByIdGetter.execute(id);

    const responseBody = HttpResponse.success(category);
    response.status = responseBody.statusCode;
    response.body = responseBody;
  };

  getCategories = async ({ response }: RouterContext<string>) => {
    const categories = await this.categoryGetter.execute();

    const responseBody = HttpResponse.success(categories);
    response.status = responseBody.statusCode;
    response.body = responseBody;
  };

  saveCategory = async (
    { request, response }: RouterContext<string>,
  ) => {
    const { name, icon } = await request.body({ type: "json" }).value;

    const category = await this.categoryCreator.execute(name, icon);

    const responseBody = HttpResponse.success(category);
    response.status = responseBody.statusCode;
    response.body = responseBody;
  };

  updateCategory = async (
    { request, response, params }: RouterContext<string>,
  ) => {
    const { id } = params;
    const { name, icon } = await request.body({ type: "json" }).value;

    if (!isIdValid(id)) {
      throw new ValidationError().addError("id", `El id ${id} is inválido`);
    }

    const category = await this.categoryUpdater.execute(id, name, icon);

    const responseBody = HttpResponse.success(category);
    response.status = responseBody.statusCode;
    response.body = responseBody;
  };

  deleteCategory = async (
    { response, params }: RouterContext<string>,
  ) => {
    const { id } = params;

    if (!isIdValid(id)) {
      throw new ValidationError().addError("id", `El id ${id} is inválido`);
    }

    await this.categoryRemover.execute(id);

    const responseBody = HttpResponse.success();
    response.status = responseBody.statusCode;
    response.body = responseBody;
  };
}
