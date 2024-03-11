import { Category } from "../../../domain/entities/category.entity.ts";
import { CategoryRepository } from "../../../domain/repositories/category.repository.ts";
import CategoryModel from "../../models/Category.ts";

export class MongoCategoryRepository implements CategoryRepository {
  getById = async (id: string): Promise<Category | null> => {
    return await CategoryModel.findById(id).lean();
  };
}
