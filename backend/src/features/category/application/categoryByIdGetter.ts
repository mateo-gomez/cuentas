import { Category } from "../domain/category.entity.ts";
import { CategoryRepository } from "../domain/category.repository.ts";
import { NotFoundError } from "../../../application/errors/notFoundError.ts";

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
