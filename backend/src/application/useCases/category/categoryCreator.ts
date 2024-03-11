import { Category } from "../../../domain/entities/category.entity.ts";
import { CategoryRepository } from "../../../domain/repositories/category.repository.ts";
import { capitalize } from "../../utils/capitalize.ts";

export class CategoryCreator {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute = async (name: string, icon: string): Promise<Category> => {
    try {
      return await this.categoryRepository.createCategory(
        capitalize(name),
        icon,
      );
    } catch (error) {
      if (error.name === "MongoServerError" && error.code === 11000) {
        throw new Error(`La categoría "${name}" ya existe`);
      }

      throw error;
    }
  };
}
