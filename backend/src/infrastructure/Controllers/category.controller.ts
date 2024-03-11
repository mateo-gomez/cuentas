import { RouterContext, Status } from "../../../deps.ts";
import { isIdValid } from "../utils/isIdValid.ts";
import { CategoryByIdGetter } from "../../application/useCases/category/categoryByIdGetter.ts";
import { CategoryGetter } from "../../application/useCases/category/categoryGetter.ts";
import { CategoryCreator } from "../../application/useCases/category/categoryCreator.ts";
import { CategoryUpdater } from "../../application/useCases/category/categoryUpdater.ts";
import { CategoryRemover } from "../../application/useCases/category/categoryRemover.ts";

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
    const category = await this.categoryByIdGetter.execute(id);

    if (!isIdValid(id)) {
      response.status = Status.BadRequest;

      return response.body = {
        message: `El id ${id} es inválido.`,
      };
    }

    response.status = Status.OK;
    response.body = category;
  };

  getCategories = async ({ response }: RouterContext<string>) => {
    const categories = await this.categoryGetter.execute();

    response.status = Status.OK;
    response.body = categories;
  };

  saveCategory = async (
    { request, response }: RouterContext<string>,
  ) => {
    const { name, icon } = await request.body({ type: "json" }).value;

    try {
      const category = await this.categoryCreator.execute(name, icon);

      response.body = category;
    } catch (error) {
      if (error.name === "MongoServerError") {
        response.status = Status.BadRequest;

        return response.body = {
          errors: { name: `La categoría "${name}" ya existe` },
        };
      }

      throw error;
    }
  };

  updateCategory = async (
    { request, response, params }: RouterContext<string>,
  ) => {
    const { id } = params;
    const { name, icon } = await request.body({ type: "json" }).value;

    if (!isIdValid(id)) {
      response.status = Status.BadRequest;

      return response.body = {
        message: `El id ${id} es inválido.`,
      };
    }

    const category = await this.categoryUpdater.execute(id, name, icon);

    response.status = Status.OK;
    response.body = category;
  };

  deleteCategory = async (
    { response, params }: RouterContext<string>,
  ) => {
    const { id } = params;

    if (!isIdValid(id)) {
      response.status = Status.BadRequest;

      return response.body = {
        message: `El id ${id} es inválido.`,
      };
    }

    await this.categoryRemover.execute(id);

    response.status = Status.OK;
    response.body = { message: "Category deleted" };
  };
}
