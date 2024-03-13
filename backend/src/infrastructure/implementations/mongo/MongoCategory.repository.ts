import { Category } from "../../../domain/entities/category.entity.ts";
import { CategoryRepository } from "../../../domain/repositories/category.repository.ts";
import CategoryModel from "../../models/Category.ts";

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
    return await CategoryModel.create({ name, icon });
  };

  updateCategory = async (
    id: string,
    name: string,
    icon: string,
  ): Promise<Category> => {
    const category = await CategoryModel.findByIdAndUpdate(id, { name, icon }, {
      returnDocument: "after",
      lean: true,
    });

    if (!category) {
      throw new Error(`Category ${id} not found`);
    }

    return category;
  };

  delete = async (id: string): Promise<void> => {
    const { deletedCount } = await CategoryModel.remove({ _id: id });

    if (deletedCount === 0) {
      throw new Error(`Category ${id} not deleted`);
    }
  };
}