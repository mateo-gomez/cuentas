import { ApplicationError } from "../../../application/errors/applicationError";
import { capitalize } from "../../../application/utils/capitalize";
import { Category } from "../../../features/category/domain/category.entity";
import { CategoryRepository } from "../../../features/category/domain/category.repository";
import { DuplicateError } from "../../../infrastructure/api/errors/duplicateError";

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
