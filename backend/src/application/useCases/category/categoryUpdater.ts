import { Category } from "../../../domain/entities/category.entity.ts";
import { CategoryRepository } from "../../../domain/repositories/category.repository.ts";
import { capitalize } from "../../utils/capitalize.ts";

export class CategoryUpdater {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute = async (
    id: string,
    name: string,
    icon: string,
  ): Promise<Category> => {
    const categoryRecord = await this.categoryRepository.getById(id);

    if (!categoryRecord) {
      throw new Error("Transacción no encontrada");
    }

    try {
      return await this.categoryRepository.updateCategory(
        id,
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
