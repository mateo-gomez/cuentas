import { Category } from "../../../domain/entities/category.entity.ts";
import { CategoryRepository } from "../../../domain/repositories/category.repository.ts";
import { DuplicateError } from "../../../infrastructure/errors/duplicateError.ts";
import { ApplicationError } from "../../errors/applicationError.ts";
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
      if (error instanceof DuplicateError) {
        throw new ApplicationError(`La categoría "${name}" ya existe`, error);
      }

      throw new ApplicationError("Error creando categoría", error);
    }
  };
}
