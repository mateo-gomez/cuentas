import { Category } from "../../../features/category/domain/category.entity";
import { CategoryRepository } from "../../../features/category/domain/category.repository";
import { DuplicateError } from "../../../infrastructure/api/errors/duplicateError";
import { DatabaseError } from "../../../infrastructure/api/errors/databaseError";
import { ApplicationError } from "../../../application/errors/applicationError";
import { NotFoundError } from "../../../application/errors/notFoundError";
import { capitalize } from "../../../application/utils/capitalize";

export class CategoryUpdater {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute = async (
    id: string,
    name?: string,
    icon?: string,
  ): Promise<Category> => {
    const category = await this.categoryRepository.getById(id);

    if (!category) {
      throw new NotFoundError("Categoría no encontrada", id);
    }

    let categoryUpdated: Category | null;

    try {
      categoryUpdated = await this.categoryRepository.updateCategory(
        id,
        capitalize(name || category.name),
        icon || category.icon,
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
