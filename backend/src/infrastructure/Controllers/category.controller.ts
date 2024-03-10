import { RouterContext, Status } from "../../../deps.ts";
import Category from "../models/Category.ts";
import { capitalize } from "../utils/capitalize.ts";
import { isIdValid } from "../utils/isIdValid.ts";

export const getCategories = async ({ response }: RouterContext<string>) => {
  response.body = await Category.find();
};

export const getCategory = async (
  { response, params }: RouterContext<string>,
) => {
  const { id } = params;

  if (!isIdValid(id)) {
    response.status = Status.BadRequest;

    return response.body = {
      message: `El id ${id} es inválido.`,
    };
  }

  const category = await Category.findOne({ _id: id });

  if (!category) {
    response.status = Status.NotFound;

    return response.body = {
      message: "Error 404: Recurso no encontrado",
    };
  }

  response.body = category;
};

export const saveCategory = async (
  { request, response }: RouterContext<string>,
) => {
  const { name, icon } = await request.body({ type: "json" }).value;

  try {
    const category = await Category.create({
      name: capitalize(name),
      icon,
    });

    response.body = category;
  } catch (error) {
    if (error.name === "MongoServerError" && error.code === 11000) {
      response.status = Status.BadRequest;
      return response.body = {
        errors: { name: `La categoría "${name}" ya existe` },
      };
    }

    throw error;
  }
};

export const updateCategory = async (
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

  const category = await Category.findOne({ _id: id });

  if (!category) {
    response.status = Status.NotFound;

    return response.body = {
      message: "Error 404: Recurso no encontrado",
    };
  }

  category.name = name ? capitalize(name) : category.name;
  category.icon = icon || category.icon;

  console.log("updated", category);

  try {
    await category.save();

    response.body = category;
  } catch (error) {
    if (error.name === "MongoServerError" && error.code === 11000) {
      response.status = Status.BadRequest;

      return response.body = {
        errors: `La categoría "${name}" ya existe`,
      };
    }

    throw error;
  }
};

export const deleteCategory = async (
  { response, params }: RouterContext<string>,
) => {
  const { id } = params;

  if (!isIdValid(id)) {
    response.status = Status.BadRequest;

    return response.body = {
      message: `El id ${id} es inválido.`,
    };
  }

  const category = await Category.remove({ _id: id });

  console.log("deleted?", category);

  response.body = { message: "Category deleted" };
};
