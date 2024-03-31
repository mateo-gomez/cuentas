import { ApplicationError } from "../../../application/errors/applicationError.ts";
import { capitalize } from "../../../application/utils/capitalize.ts";
import { Category } from "../../../features/category/domain/category.entity.ts";
import { CategoryRepository } from "../../../features/category/domain/category.repository.ts";
import { DuplicateError } from "../../../infrastructure/api/errors/duplicateError.ts";

export class CategoryCreator {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute = async (name: string, icon: string): Promise<Category> => {
    try {
      return await this.categoryRepository.createCategory(
        capitalize(name),
        icon,
      );
    } catch (error) {
      if (error instanceof DuplicateError) {
        throw new ApplicationError(`La categoría "${name}" ya existe`, error);
      }

      throw new ApplicationError("Error creando categoría", error);
    }
  };
}
