import { Category } from "../../../domain/entities/category.entity.ts";
import { CategoryRepository } from "../../../domain/repositories/category.repository.ts";
import CategoryModel from "../../models/Category.ts";

export class MongoCategoryRepository implements CategoryRepository {
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
    categoryData: Omit<Category, "_id" | "createdAt" | "updatedAt">,
  ): Promise<Category> => {
    const category = await CategoryModel.findByIdAndUpdate(id, categoryData, {
      returnDocument: "after",
      lean: true,
    });

    if (!category) {
      throw new Error(`Category ${id} not found`);
    }

    return category;
  };
}
