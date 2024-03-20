import { Category } from "../../../domain/entities/category.entity.ts";
import { CategoryRepository } from "../../../domain/repositories/category.repository.ts";
import { NotFoundError } from "../../errors/notFoundError.ts";

export class CategoryByIdGetter {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute = async (id: string): Promise<Category> => {
    const category = await this.categoryRepository.getById(id);

    if (!category) {
      throw new NotFoundError("Categoría no encontrada", id);
    }

    return category;
  };
}
