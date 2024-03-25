import { Category } from "../../../domain/entities/category.entity.ts";
import { CategoryRepository } from "../../../domain/repositories/category.repository.ts";
import { DuplicateError } from "../../../infrastructure/api/errors/duplicateError.ts";
import { DatabaseError } from "../../../infrastructure/api/errors/databaseError.ts";
import { ApplicationError } from "../../errors/applicationError.ts";
import { NotFoundError } from "../../errors/notFoundError.ts";
import { capitalize } from "../../utils/capitalize.ts";

export class CategoryUpdater {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute = async (
    id: string,
    name: string,
    icon: string,
  ): Promise<Category> => {
    const exists = await this.categoryRepository.exists(id);

    if (!exists) {
      throw new NotFoundError("Categoría no encontrada", id);
    }

    let categoryUpdated: Category | null;

    try {
      categoryUpdated = await this.categoryRepository.updateCategory(
        id,
        capitalize(name),
        icon,
      );
    } catch (error) {
      if (error instanceof DuplicateError) {
        throw new ApplicationError(`La categoría "${name}" ya existe`, error);
      }

      if (error instanceof DatabaseError) {
        throw new ApplicationError("Error al guardar categoría", error);
      }

      throw error;
    }

    if (!categoryUpdated) {
      throw new NotFoundError("Categoría no encontrada", id);
    }

    return categoryUpdated;
  };
}
