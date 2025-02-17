import { Category } from "../../domain/category.entity";
import { DatabaseError } from "../../../../infrastructure/api/errors/databaseError";
import { CategoryRepository } from "../../domain/category.repository";
import CategoryModel from "./Category";
import { DuplicateError } from "../../../../infrastructure/api/errors/duplicateError";

export class MongoCategoryRepository implements CategoryRepository {
  exists = async (id: string): Promise<boolean> => {
    const exists = await CategoryModel.exists({ _id: id });

    return exists !== null;
  };

  getById = async (id: string): Promise<Category | null> => {
    return await CategoryModel.findById(id).lean();
  };

  getAll = async (): Promise<Category[]> => {
    return await CategoryModel.find().lean();
  };

  createCategory = async (
    name: string,
    icon: string,
  ): Promise<Category> => {
    try {
      return await CategoryModel.create({ name, icon });
    } catch (error) {
      if (error.name === "MongoServerError" && error.code === 11000) {
        throw new DuplicateError(
          `La categoría "${name}" already exists.`,
          error,
        );
      }

      throw new DatabaseError("Error creando categoría", error);
    }
  };

  updateCategory = async (
    id: string,
    name: string,
    icon: string,
  ): Promise<Category | null> => {
    try {
      const category = await CategoryModel.findByIdAndUpdate(
        id,
        { name, icon },
        {
          returnDocument: "after",
          lean: true,
        },
      );

      return category;
    } catch (error) {
      if (error.name === "MongoServerError" && error.code === 11000) {
        throw new DuplicateError(
          `La categoría "${name}" already exists.`,
          error,
        );
      }

      throw new DatabaseError("Error al guardar categoría", error);
    }
  };

  delete = async (id: string): Promise<void> => {
    const { deletedCount } = await CategoryModel.remove({ _id: id });

    if (deletedCount === 0) {
      throw new DatabaseError(`Category ${id} not deleted`);
    }
  };
}
